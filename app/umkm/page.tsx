import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import KartuUmkm from '@/components/KartuUmkm';
import { produkPublik, umkmPublik } from '@/lib/publik';

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

export const metadata: Metadata = {
  title: 'Usaha warga',
  description: 'Kenali usaha warga Desa Langensari dan lihat produk yang tersedia.',
};

export default async function HalamanDaftarUmkm() {
  let daftar: Awaited<ReturnType<typeof umkmPublik>> = [];
  let jumlahProduk: Record<string, number> = {};
  let gagal = false;

  try {
    const [umkm, produk] = await Promise.all([umkmPublik(), produkPublik()]);
    daftar = umkm;
    jumlahProduk = produk.reduce<Record<string, number>>((acc, p) => {
      if (p.umkmId) acc[p.umkmId] = (acc[p.umkmId] || 0) + 1;
      return acc;
    }, {});
  } catch {
    gagal = true;
  }

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
          Usaha warga Langensari
        </h1>
        <p className="mt-3 max-w-2xl font-body leading-relaxed text-muted text-pretty">
          Pilih usaha untuk melihat profil, produk, dan cara menghubungi pemiliknya.
        </p>

        {gagal ? (
          <p className="mt-8 font-body text-sm text-muted">
            Daftar usaha belum dapat dimuat. Periksa koneksi internet, kemudian muat ulang halaman.
          </p>
        ) : daftar.length === 0 ? (
          <p className="mt-8 font-body text-sm text-muted">Belum ada usaha yang tampil di portal ini.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {daftar.map((u, i) => (
              <KartuUmkm
                key={u.id}
                umkm={u}
                jumlahProduk={jumlahProduk[u.id] || 0}
                indeks={i}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
