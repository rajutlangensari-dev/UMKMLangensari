/**
 * Uji kontras warna. `npm run uji:warna`
 *
 * KENAPA INI ADA
 *
 * Portal ini punya 2 mode tampilan x 5 tema (portal + 4 tema toko) = 10 set
 * warna, masing-masing dengan sekitar 8 pasangan yang harus terbaca. Delapan
 * puluh pemeriksaan. Tidak ada manusia yang akan mengerjakannya dua kali,
 * apalagi tiap kali satu warna disentuh.
 *
 * Dan kegagalannya tidak berisik: teks bermutu kontras 3,8:1 tetap terbaca di
 * monitor bagus di ruangan ber-AC. Ia baru hilang di HP murah, di bawah
 * matahari, di tangan orang yang matanya sudah tidak setajam dulu — persis
 * keadaan yang tidak pernah terjadi di meja pengembang.
 *
 * NILAINYA DIBACA DARI `globals.css`, TIDAK DISALIN KE SINI.
 *
 * Ini bukan kerapian, ini inti gunanya. Skrip yang memegang salinan nilainya
 * sendiri akan tetap lulus setelah seseorang mengubah warna di CSS dan lupa
 * memperbarui skripnya — dan sejak saat itu ia berhenti menguji apa pun sambil
 * tetap berwarna hijau.
 *
 * AMBANGNYA
 *
 *   teks biasa   >= 4.5:1   (WCAG 2.1 AA)
 *   garis/kotak  >= 3.0:1   (WCAG 2.1 AA untuk komponen non-teks)
 */

import fs from 'node:fs';
import path from 'node:path';

const BERKAS = path.join(process.cwd(), 'app', 'globals.css');
const css = fs.readFileSync(BERKAS, 'utf8');

type Warna = [number, number, number];
type Set = Record<string, Warna>;

/** Ambil isi satu blok `<pemilih> { ... }` teratas yang cocok. */
function blok(pemilih: string): string {
  const i = css.indexOf(pemilih);
  if (i === -1) throw new Error(`Blok tidak ditemukan di globals.css: ${pemilih}`);
  const buka = css.indexOf('{', i);
  const tutup = css.indexOf('}', buka);
  return css.slice(buka + 1, tutup);
}

/** Semua `--nama: r g b;` di dalam sepotong CSS. */
function token(isi: string): Set {
  const hasil: Set = {};
  for (const m of isi.matchAll(/--([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) {
    hasil[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return hasil;
}

// ---------- Kontras ----------

function kanal(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminansi([r, g, b]: Warna): number {
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

function kontras(a: Warna, b: Warna): number {
  const la = luminansi(a);
  const lb = luminansi(b);
  const terang = Math.max(la, lb);
  const gelap = Math.min(la, lb);
  return (terang + 0.05) / (gelap + 0.05);
}

// ---------- Susun set warna ----------

const TERANG = token(blok(':root {'));
const GELAP = token(blok(":root[data-theme='gelap'] {"));

/** Tema toko menimpa `--aksen*` saja; sisanya diwarisi dari mode yang berlaku. */
const TEMA = ['zaitun', 'tanah', 'nila', 'sawah'] as const;

function temaTerang(nama: string): Set {
  return { ...TERANG, ...token(blok(`[data-tema='${nama}'] {`)) };
}

function temaGelap(nama: string): Set {
  // Dua blok: satu yang menyetel `--aksen-ink` untuk semua tema sekaligus, satu
  // lagi khusus temanya. Keduanya harus ikut, kalau tidak warna teks di atas
  // tombol tema di mode gelap diuji dengan nilai mode terang — dan lulus palsu.
  const bersama = token(blok(":root[data-theme='gelap'] [data-tema='zaitun'],"));
  const sendiri = token(blok(`:root[data-theme='gelap'] [data-tema='${nama}'] {`));
  return { ...GELAP, ...bersama, ...sendiri };
}

// ---------- Pasangan yang benar-benar dipakai ----------

interface Pasangan {
  depan: string;
  latar: string;
  ambang: number;
  ket: string;
}

const PASANGAN: Pasangan[] = [
  { depan: 'ink', latar: 'paper', ambang: 4.5, ket: 'teks utama di atas halaman' },
  { depan: 'ink', latar: 'surface', ambang: 4.5, ket: 'teks utama di atas kartu' },
  { depan: 'muted', latar: 'paper', ambang: 4.5, ket: 'teks pendamping di atas halaman' },
  { depan: 'muted', latar: 'surface', ambang: 4.5, ket: 'teks pendamping di atas kartu' },
  { depan: 'aksen-kuat', latar: 'paper', ambang: 4.5, ket: 'tautan dan harga' },
  { depan: 'aksen-kuat', latar: 'surface', ambang: 4.5, ket: 'tautan di atas kartu' },
  { depan: 'aksen-ink', latar: 'aksen-kuat', ambang: 4.5, ket: 'teks di dalam tombol' },
  { depan: 'line', latar: 'paper', ambang: 1.2, ket: 'garis pemisah (dekoratif)' },
  { depan: 'aksen', latar: 'paper', ambang: 1.5, ket: 'aksen hiasan (BUKAN untuk teks)' },
];

// ---------- Jalan ----------

let gagal = 0;
let lolos = 0;

function periksa(namaSet: string, set: Set) {
  console.log(`\n${namaSet}`);
  for (const p of PASANGAN) {
    const depan = set[p.depan];
    const latar = set[p.latar];
    if (!depan || !latar) {
      console.log(` GAGAL  ${p.depan}/${p.latar} — token tidak ada di ${namaSet}`);
      gagal++;
      continue;
    }
    const r = kontras(depan, latar);
    const ok = r >= p.ambang;
    const angka = r.toFixed(2).padStart(5);
    if (ok) {
      lolos++;
      console.log(`  ok   ${angka}:1  ${p.depan}/${p.latar}  — ${p.ket}`);
    } else {
      gagal++;
      console.log(
        ` GAGAL ${angka}:1  ${p.depan}/${p.latar}  — ${p.ket} (butuh ${p.ambang}:1)`
      );
    }
  }
}

periksa('Portal — mode terang', TERANG);
periksa('Portal — mode gelap', GELAP);
for (const t of TEMA) periksa(`Tema toko "${t}" — mode terang`, temaTerang(t));
for (const t of TEMA) periksa(`Tema toko "${t}" — mode gelap`, temaGelap(t));

// Penjagaan terpisah: warna merek mentah tidak boleh diam-diam dipakai sebagai
// warna teks. Kalau suatu hari `--aksen` dan `--aksen-kuat` disamakan di mode
// terang, seluruh situs kehilangan kontrasnya tanpa satu pun pemeriksaan di atas
// gagal — karena yang diuji `--aksen-kuat`, dan nilainya memang berubah ikut.
console.log('\nPenjagaan tambahan');
const aksenTerangSama =
  TERANG['aksen'].join() === TERANG['aksen-kuat'].join();
if (aksenTerangSama && kontras(TERANG['aksen'], TERANG['paper']) < 4.5) {
  console.log(' GAGAL  --aksen dan --aksen-kuat disamakan padahal kontrasnya kurang');
  gagal++;
} else {
  lolos++;
  console.log('  ok   --aksen tidak dipakai sebagai warna teks di mode terang');
}

console.log(`\n${lolos} lolos, ${gagal} gagal.`);
process.exit(gagal ? 1 : 0);
