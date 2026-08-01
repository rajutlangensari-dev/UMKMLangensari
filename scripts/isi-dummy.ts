/**
 * Isi portal dengan UMKM dan produk palsu untuk pengujian.
 *
 *   npm run dummy          isi data
 *   npm run dummy -- hapus sembunyikan lagi
 *
 * "hapus" tidak benar-benar menghapus baris, tapi menyetel status UMKM dummy
 * jadi `nonaktif`. Efeknya sama dari sisi pengunjung — UMKM-nya hilang dan
 * seluruh produknya ikut hilang dari katalog (lihat portalSaringProdukPublik_).
 * Dipilih begini karena tidak merusak: kalau ternyata masih dibutuhkan, tinggal
 * dijalankan ulang tanpa "hapus". Membersihkan barisnya benar-benar cukup dengan
 * menghapus baris di Google Sheet secara manual.
 *
 * Berkas catatan `scripts/.dummy.json` menyimpan id UMKM yang dibuat skrip ini,
 * supaya yang disembunyikan nanti tepat yang dibuat di sini dan tidak menyentuh
 * UMKM sungguhan.
 */

import fs from 'node:fs';
import path from 'node:path';
import { UMKM_DUMMY } from './data-dummy.ts';
import { TATA_LETAK, TEMA, halamanBawaan, tulisHalaman } from '../lib/blok.ts';
import type { Umkm } from '../lib/types.ts';

const CATATAN = path.join(process.cwd(), 'scripts', '.dummy.json');

function muatEnv(): Record<string, string> {
  const berkas = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(berkas)) throw new Error('.env.local tidak ditemukan.');
  const hasil: Record<string, string> = {};
  for (const baris of fs.readFileSync(berkas, 'utf8').split('\n')) {
    const t = baris.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) hasil[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return hasil;
}

const env = muatEnv();
const URL_BACKEND = env.NEXT_PUBLIC_APPS_SCRIPT_URL;
const RAHASIA = env.APPS_SCRIPT_SECRET;

async function panggil<T>(action: string, data?: Record<string, unknown>): Promise<T> {
  const res = await fetch(URL_BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, rahasia: RAHASIA, data }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Permintaan gagal.');
  return json.data as T;
}

async function isi() {
  const adaSebelumnya: Umkm[] = await panggil('portal.daftarUmkm', {});
  const slugTerpakai = new Set(adaSebelumnya.map((u) => u.slug));
  const dibuat: string[] = [];
  let jumlahProduk = 0;

  for (const d of UMKM_DUMMY) {
    if (slugTerpakai.has(d.slug)) {
      console.log(`  lewati  ${d.nama} (slug sudah ada)`);
      continue;
    }

    // Tema dan bentuk halaman digilir, bukan disamakan. Dua puluh halaman dummy
    // yang identik tidak membuktikan apa pun tentang fitur yang justru ada untuk
    // membuat tiap usaha terlihat berbeda.
    const tataLetak = TATA_LETAK[dibuat.length % TATA_LETAK.length];
    const tema = TEMA[dibuat.length % TEMA.length];

    const umkm: Umkm = await panggil('portal.buatUmkm', {
      nama: d.nama,
      slug: d.slug,
      bio: d.bio,
      kontakWa: d.kontakWa,
      alamat: d.alamat,
      tema,
      tataLetak,
      halaman: tulisHalaman(
        halamanBawaan(
          { nama: d.nama, bio: d.bio, foto: '', alamat: d.alamat, kontakWa: d.kontakWa },
          tataLetak
        )
      ),
      foto: '',
    });
    dibuat.push(umkm.id);

    for (const p of d.produk) {
      await panggil('portal.buatProduk', {
        umkmId: umkm.id,
        namaProduk: p.nama,
        kategori: p.kategori,
        harga: p.harga,
        stok: p.stok || 'Tersedia',
        deskripsi: p.deskripsi,
        status: 'Aktif',
      });
      jumlahProduk++;
    }
    console.log(`  dibuat  ${d.nama}  /umkm/${umkm.slug}  (${d.produk.length} produk)`);
  }

  const lama: string[] = fs.existsSync(CATATAN) ? JSON.parse(fs.readFileSync(CATATAN, 'utf8')) : [];
  fs.writeFileSync(CATATAN, JSON.stringify([...new Set([...lama, ...dibuat])], null, 2));

  console.log(`\n${dibuat.length} UMKM dan ${jumlahProduk} produk ditambahkan.`);
  console.log(`Catatan id disimpan di scripts/.dummy.json`);
  console.log(`Sembunyikan lagi dengan:  npm run dummy -- hapus`);
}

async function sembunyikan() {
  if (!fs.existsSync(CATATAN)) {
    console.log('scripts/.dummy.json tidak ada. Tidak tahu mana yang dummy, jadi tidak menyentuh apa pun.');
    return;
  }
  const id: string[] = JSON.parse(fs.readFileSync(CATATAN, 'utf8'));
  for (const i of id) {
    try {
      const u: Umkm = await panggil('portal.perbaruiUmkm', { id: i, status: 'nonaktif' });
      console.log(`  nonaktif  ${u.nama}`);
    } catch (err) {
      console.log(`  gagal     ${i} — ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\n${id.length} UMKM dummy disembunyikan beserta produknya.`);
  console.log('Baris di sheet tidak dihapus. Hapus manual di Google Sheet kalau memang mau bersih.');
}

async function jalan() {
  if (!URL_BACKEND) throw new Error('NEXT_PUBLIC_APPS_SCRIPT_URL kosong di .env.local.');
  if (!RAHASIA) throw new Error('APPS_SCRIPT_SECRET kosong di .env.local.');
  if (process.argv.includes('hapus')) await sembunyikan();
  else await isi();
}

jalan().catch((err) => {
  console.error('GAGAL:', err.message);
  process.exit(1);
});
