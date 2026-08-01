import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { produkPublik, umkmPublik } from '@/lib/publik';
import { normalisasiFotoUrl } from '@/lib/api';

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
  description: 'Kenali usaha warga Desa Langensari dan lihat produk yang mereka jual.',
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

        {gagal ? (
          <p className="mt-8 font-body text-sm text-muted">
            Daftar usaha belum bisa dimuat. Periksa koneksi, lalu muat ulang halaman.
          </p>
        ) : daftar.length === 0 ? (
          <p className="mt-8 font-body text-sm text-muted">Belum ada usaha yang tampil di portal ini.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {daftar.map((u, i) => {
              const foto = normalisasiFotoUrl(u.foto, 200);
              const n = jumlahProduk[u.id] || 0;
              return (
                <Link
                  key={u.id}
                  href={`/umkm/${u.slug}`}
                  className="naik angkat tekan flex items-center gap-4 rounded-kartu border border-line bg-paper p-4"
                  style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface">
                    {foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={foto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-muted/50">
                        {u.nama.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="warna-interaktif truncate font-display font-semibold text-ink">
                      {u.nama}
                    </h2>
                    <p className="mt-0.5 font-body text-sm text-muted">
                      {n === 0 ? 'Produk belum tersedia' : `${n} produk tersedia`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
