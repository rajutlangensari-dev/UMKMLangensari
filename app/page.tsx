import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Fakta from '@/components/Fakta';
import RailKategori from '@/components/RailKategori';
import PratinjauProduk from '@/components/PratinjauProduk';
import Footer from '@/components/Footer';

import { produkPublik, umkmPublik } from '@/lib/publik';
import type { Produk, SorotanUsaha } from '@/lib/types';

/**
 * Dirender ULANG TIAP PERMINTAAN, tapi datanya diambil dari cache 60 detik
 * (lihat lib/publik.ts). Dua hal yang berbeda, dan bedanya menentukan.
 *
 * Sempat dicoba kebalikannya: halaman ikut di-cache sebagai HTML (ISR 60
 * detik). Itu memang paling cepat — berkas siap saji, tanpa render sama
 * sekali. Tapi ia diprarender SAAT BUILD, dan build yang kebetulan berjalan
 * saat Apps Script sedang lambat menghasilkan halaman KOSONG yang lalu
 * disajikan apa adanya. Diuji langsung dan memang terjadi: beranda hasil build
 * berisi nol produk.
 *
 * Untuk katalog desa yang di-deploy sesekali dan backend-nya sekali waktu
 * menggantung berdetik-detik, mempertaruhkan seluruh isi situs pada keadaan
 * backend di satu menit saat build adalah harga yang jauh lebih mahal daripada
 * biaya merender ulang — yang toh cuma puluhan milidetik karena datanya sudah
 * ada di memori.
 */
export const dynamic = 'force-dynamic';

/** Berapa usaha yang berputar di sorotan, dan berapa barang tiap usaha. */
const MAKS_SOROTAN = 5;
const PRODUK_PER_SOROTAN = 4;

/**
 * Susun sorotan beranda: pelaku usaha beserta beberapa barangnya.
 *
 * Usaha tanpa produk aktif TIDAK ikut. Slide berisi profil dengan kotak barang
 * yang kosong di bawahnya terbaca sebagai usaha yang tutup, dan itu justru
 * kebalikan dari maksud halaman muka.
 *
 * URUTANNYA DIGESER TIAP HARI. Portal ini milik bersama, dan halaman muka adalah
 * tempatnya yang paling berharga; memakai urutan sheet apa adanya berarti lima
 * usaha teratas mendapatkannya selamanya sementara yang lain tidak pernah.
 * Pergeseran memakai tanggal, bukan acak, supaya hasilnya tetap sama sepanjang
 * hari — render acak per permintaan membuat halaman ini mustahil di-cache dan
 * membuat uji otomatis apa pun jadi rapuh.
 */
function susunSorotan(umkm: Awaited<ReturnType<typeof umkmPublik>>, produk: Produk[]) {
  const berproduk = umkm
    .map((u) => ({
      slug: u.slug,
      nama: u.nama,
      bio: u.bio,
      foto: u.foto,
      produk: produk.filter((p) => p.umkmId === u.id).slice(0, PRODUK_PER_SOROTAN),
    }))
    .filter((s) => s.slug && s.produk.length > 0);

  if (berproduk.length === 0) return [] as SorotanUsaha[];

  const geser = new Date().getDate() % berproduk.length;
  return [...berproduk.slice(geser), ...berproduk.slice(0, geser)].slice(0, MAKS_SOROTAN);
}

/**
 * Beranda. SERVER COMPONENT — dan itu bukan detail teknis, itu inti perbaikannya.
 *
 * Versi sebelumnya `'use client'` dan mengambil produk di `useEffect`. Akibatnya
 * berantai, dan semuanya terlihat di layar orang:
 *
 * 1. Cat pertama halaman KOSONG, lalu berganti begitu data tiba — tingginya
 *    berubah dan seluruh halaman melompat.
 * 2. `fetchPriority="high"` pada foto hero tidak ada gunanya: fotonya belum ada
 *    di HTML saat peramban mulai memuat, jadi LCP menunggu JavaScript dulu.
 * 3. Di HP dengan jaringan desa, jeda itu berarti beberapa detik layar kosong
 *    pada halaman muka sebuah katalog.
 *
 * Sekarang datanya diambil di server dan ikut terkirim sebagai HTML. Komponen
 * kliennya tetap kecil dan menangani yang memang butuh interaksi saja: indeks
 * carousel dan tombol rel.
 *
 * Kalau backend gagal, halaman TIDAK kosong: hero jatuh ke panel tenang dan
 * bagian yang bergantung produk tidak dirender. Halaman muka yang tetap utuh
 * lebih baik daripada halaman galat.
 */
export default async function Beranda() {
  // Dua permintaan, dijalankan berbarengan, dan kegagalan masing-masing ditangani
  // sendiri-sendiri. `Promise.all` yang polos akan membuat daftar UMKM yang gagal
  // ikut mengosongkan katalog produknya, padahal bagian bawah halaman ini masih
  // bisa tayang penuh tanpa sorotan.
  const [hasilProduk, hasilUmkm] = await Promise.allSettled([
    produkPublik(),
    umkmPublik(),
  ]);

  const produk: Produk[] = hasilProduk.status === 'fulfilled' ? hasilProduk.value : [];
  const sorotan =
    hasilUmkm.status === 'fulfilled' ? susunSorotan(hasilUmkm.value, produk) : [];

  // Cerita.tsx dibuang dari beranda. Isinya kisah satu usaha rajut — benar saat
  // situs ini memang toko rajut, salah begitu naik jadi portal desa: menaruh
  // cerita satu pelaku usaha di beranda bersama membuat yang lain terlihat
  // seperti pelengkap. Ceritanya pindah ke bio halaman UMKM masing-masing,
  // yaitu data, bukan kode.
  return (
    <>
      <Header />
      <main>
        <Hero sorotan={sorotan} />
        {/* Angkanya dihitung dari data yang sudah ada di atas — tidak ada
            permintaan tambahan ke Apps Script untuk baris ini. */}
        <Fakta produk={produk} sorotan={sorotan} />
        <RailKategori produk={produk} />
        <PratinjauProduk produk={produk} />
      </main>
      <Footer />
    </>
  );
}
