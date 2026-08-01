/**
 * Pembacaan data untuk HALAMAN PUBLIK, disimpan sementara.
 *
 * HANYA UNTUK KODE SERVER. `next/cache` tidak bisa dibundel ke peramban; satu
 * komponen klien yang mengimpor berkas ini akan menggagalkan build.
 *
 * KENAPA BUKAN `export const revalidate` DI HALAMAN
 *
 * Next.js hanya menyimpan cache untuk `fetch` bermetode GET. Panggilan kita ke
 * Apps Script memakai POST — dan harus, karena rahasianya ada di badan
 * permintaan, bukan di alamat; kalau di alamat, ia tercatat di log server dan
 * riwayat peramban. Jadi `revalidate` di halaman tidak akan menyentuh panggilan
 * itu sama sekali.
 *
 * `unstable_cache` menyimpan hasil sebuah fungsi async apa pun isinya, termasuk
 * POST. Namanya menakutkan tapi ia bagian tetap dari Next 14. Alternatifnya cuma
 * tiga dan ketiganya lebih buruk: mengubah Apps Script agar menerima GET
 * (rahasia pindah ke alamat — ditolak), cache di memori proses (hilang tiap
 * deploy, tidak dibagi antar-instans), atau tidak melakukan apa-apa.
 *
 * KENAPA INI PENTING
 *
 * Diukur 1 Agustus 2026: satu permintaan ke Apps Script memakan 4,2 detik, dan
 * sekali waktu 306 detik sampai halaman berhenti menjawab. Tanpa lapisan ini,
 * SETIAP pengunjung menanggung angka itu. Dengan lapisan ini, yang menanggungnya
 * satu permintaan tiap menit.
 *
 * Sifatnya stale-while-revalidate: yang datang saat isinya sudah basi tetap
 * dilayani SEKETIKA dengan data lama, dan penyegarannya berjalan di belakang.
 *
 * YANG TIDAK BOLEH MEMAKAI BERKAS INI
 *
 * Panel. Orang yang baru menekan Simpan harus melihat hasilnya, bukan versi
 * semenit lalu. `/kelola/*` tetap memanggil `lib/backend.ts` langsung.
 */

import { unstable_cache } from 'next/cache';
import { ambilProdukAktif } from './api';
import { ambilUmkmAktif, ambilUmkmBySlug } from './backend';

/**
 * Tag untuk membuang cache saat data berubah.
 *
 * Ini yang membuat cache aman dipakai. Tanpa `revalidateTag` di jalur tulis,
 * Korwil akan menambah produk, membuka situsnya, tidak melihat apa-apa, lalu
 * menambah produk itu lagi — bug yang jauh lebih buruk daripada lambat.
 */
export const TAG_PRODUK = 'produk';
export const TAG_UMKM = 'umkm';

/**
 * 60 detik, seragam untuk semua halaman.
 *
 * Sempat ditimbang memberi halaman toko umur lebih pendek karena pemiliknya yang
 * paling sering menyunting — tapi `revalidateTag` sudah menutup kasus itu
 * sepenuhnya. Umur pendek cuma menambah satu angka lagi yang harus diingat orang
 * berikutnya.
 */
const UMUR_DETIK = 60;

export const produkPublik = unstable_cache(
  () => ambilProdukAktif(),
  ['publik-produk-aktif'],
  { revalidate: UMUR_DETIK, tags: [TAG_PRODUK] }
);

export const umkmPublik = unstable_cache(
  () => ambilUmkmAktif(),
  ['publik-umkm-aktif'],
  { revalidate: UMUR_DETIK, tags: [TAG_UMKM] }
);

/**
 * Slug ikut jadi bagian kunci cache-nya secara otomatis — `unstable_cache`
 * menyertakan argumen fungsinya, jadi dua toko berbeda tidak akan saling
 * menimpa isi cache.
 */
export const umkmPublikBySlug = unstable_cache(
  (slug: string) => ambilUmkmBySlug(slug),
  ['publik-umkm-slug'],
  { revalidate: UMUR_DETIK, tags: [TAG_UMKM] }
);
