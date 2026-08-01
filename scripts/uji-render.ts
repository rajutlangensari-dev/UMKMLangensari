/**
 * Uji render halaman panel. `npm run dev` di satu terminal, `npm run uji:render`
 * di terminal lain.
 *
 * KENAPA INI ADA
 *
 * Seluruh halaman panel bersifat dinamis (`ƒ` di keluaran `next build`), jadi ia
 * TIDAK PERNAH dijalankan saat build. Akibatnya `tsc`, `next lint`, dan
 * `next build` bisa lolos semua sementara halamannya melempar galat begitu
 * dibuka. Persis yang terjadi pada:
 *
 *     TypeError: (0 , _Cari__WEBPACK_IMPORTED_MODULE__.cocok) is not a function
 *
 * — fungsi biasa yang diekspor dari berkas `'use client'` lalu dipanggil dari
 * Server Component. Sah menurut TypeScript, mati saat dijalankan.
 *
 * `uji-alur.mjs` juga tidak menangkapnya: tanpa sesi, panel dialihkan ke /masuk
 * sebelum sempat merender apa pun.
 *
 * CARA KERJANYA, DAN KENAPA AMAN
 *
 * Skrip ini MENANDATANGANI cookie sesi sendiri memakai SESSION_SECRET dari
 * .env.local, lalu membuka tiap halaman panel dengan cookie itu. Sesi portal ini
 * stateless — `sesiSaatIni()` hanya memverifikasi tanda tangan dan tidak menengok
 * sheet — jadi TIDAK ADA akun yang dibuat dan TIDAK ADA baris yang ditulis.
 * Semua permintaannya GET.
 *
 * Karena itu skrip ini hanya untuk localhost. Ia menolak berjalan ke alamat lain.
 */

import fs from 'node:fs';
import path from 'node:path';

const ASAL = process.env.UJI_ASAL || 'http://localhost:3000';

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(ASAL)) {
  console.error(`Menolak berjalan ke ${ASAL}. Skrip ini hanya untuk localhost.`);
  process.exit(1);
}

// Dimuat sebelum lib/auth diimpor: modul itu membaca SESSION_SECRET saat dimuat.
const berkasEnv = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(berkasEnv)) {
  console.error('.env.local tidak ditemukan.');
  process.exit(1);
}
for (const baris of fs.readFileSync(berkasEnv, 'utf8').split('\n')) {
  const cocok = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (cocok) process.env[cocok[1]] = cocok[2].replace(/^["']|["']$/g, '');
}

const { buatToken, NAMA_COOKIE } = await import('../lib/auth.ts');

let lolos = 0;
let gagal = 0;

function cek(nama: string, benar: boolean, ket = '') {
  if (benar) {
    console.log(`  OK   ${nama}`);
    lolos++;
  } else {
    console.log(` GAGAL ${nama}${ket ? ' — ' + ket : ''}`);
    gagal++;
  }
}

function kuki(peran: 'admin' | 'umkm', umkmId: string) {
  const token = buatToken({
    akunId: 'uji-render',
    namaPengguna: 'uji-render',
    peran,
    umkmId,
  });
  return `${NAMA_COOKIE}=${token}`;
}

/** Buka satu halaman, pastikan 200 DAN tidak ada jejak galat render di badannya. */
async function buka(jalur: string, cookie: string) {
  const res = await fetch(`${ASAL}${jalur}`, { headers: { Cookie: cookie } });
  const badan = await res.text();

  if (res.status !== 200) {
    cek(`GET ${jalur}`, false, `status ${res.status}`);
    return '';
  }

  // Next.js dev membalas 200 sambil menyisipkan overlay galat, jadi status saja
  // tidak cukup membuktikan halamannya benar-benar ter-render.
  const jejak = [
    'is not a function',
    'Internal Server Error',
    'Unhandled Runtime Error',
    'Application error',
    'call_stack',
  ].find((t) => badan.includes(t));

  cek(`GET ${jalur}`, !jejak, jejak ? `ada "${jejak}" di badan respons` : '');
  return badan;
}

async function jalan() {
  console.log(`Menguji render panel di ${ASAL}\n`);
  console.log('Sesi ditandatangani lokal. Tidak ada akun dibuat, tidak ada data ditulis.\n');

  // --- Super admin ---
  console.log('Peran admin:');
  const adm = kuki('admin', '');
  for (const jalur of [
    '/kelola',
    '/kelola/produk',
    '/kelola/produk?q=rajut&status=aktif',
    '/kelola/umkm',
    '/kelola/umkm?q=konveksi',
    '/kelola/umkm/baru',
    '/kelola/akun',
    '/kelola/akun?q=a',
    '/kelola/sandi',
  ]) {
    await buka(jalur, adm);
  }

  // Halaman yang butuh id nyata. Id-nya diambil dari daftar yang baru dirender,
  // bukan ditebak.
  const daftar = await buka('/kelola/umkm', adm);
  // Semua kecocokan diperiksa, bukan yang pertama saja: tautan "Daftarkan usaha"
  // (/kelola/umkm/baru) hampir selalu muncul lebih dulu di badan halaman, dan
  // mengambil kecocokan pertama membuat halaman detail diam-diam terlewat.
  const id = [...daftar.matchAll(/\/kelola\/umkm\/([a-zA-Z0-9_-]+)(?:["/])/g)]
    .map((m) => m[1])
    .find((x) => x !== 'baru');
  if (id) {
    await buka(`/kelola/umkm/${id}`, adm);
    await buka(`/kelola/umkm/${id}/halaman`, adm);
  } else {
    console.log('  (lewati halaman detail — belum ada UMKM terdaftar)');
  }

  const ngawur = await fetch(`${ASAL}/kelola/umkm/id-yang-tidak-ada`, {
    headers: { Cookie: adm },
  });
  cek('Id UMKM ngawur balas 404', ngawur.status === 404, `dapat ${ngawur.status}`);

  // --- Pemilik UMKM ---
  console.log('\nPeran umkm:');
  const umkmId = id ?? 'tidak-ada';
  const pem = kuki('umkm', umkmId);
  for (const jalur of ['/kelola', '/kelola/produk', '/kelola/halaman', '/kelola/profil']) {
    await buka(jalur, pem);
  }

  for (const jalur of ['/kelola/akun', '/kelola/umkm']) {
    const res = await fetch(`${ASAL}${jalur}`, {
      headers: { Cookie: pem },
      redirect: 'manual',
    });
    cek(
      `Peran umkm dialihkan dari ${jalur}`,
      res.status === 307,
      `dapat ${res.status}`
    );
  }

  console.log(`\n${lolos} lolos, ${gagal} gagal.`);
  process.exit(gagal ? 1 : 0);
}

jalan().catch((err) => {
  console.error('\nGAGAL menjalankan uji:', err.message);
  console.error(`Pastikan \`npm run dev\` sudah berjalan di ${ASAL}`);
  process.exit(1);
});
