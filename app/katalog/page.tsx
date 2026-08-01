import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GridProduk from '@/components/GridProduk';
import { produkPublik } from '@/lib/publik';
import type { Produk } from '@/lib/types';

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

export const metadata = {
  title: 'Katalog produk',
  description: 'Temukan produk dari usaha warga Desa Langensari dan hubungi pembuatnya melalui WhatsApp.',
};

/**
 * Katalog. SERVER COMPONENT, sama alasannya dengan beranda.
 *
 * Versi sebelumnya mengambil produk di `useEffect` lalu menampilkan rangka muat
 * berkilau selama menunggu. Rangka itu punya masalah yang lebih halus daripada
 * sekadar lambat: bentuknya TIDAK SAMA dengan kisi aslinya — rangka memakai
 * 2/3 kolom, rasio 4:5, dan lebar `max-w-7xl`, sedangkan kisi produk memakai
 * 2/4 kolom, rasio 1:1, dan `max-w-6xl`. Jadi komentarnya yang berbunyi "tata
 * letak tidak melompat saat data datang" justru menjanjikan hal yang tidak
 * terjadi; halamannya melompat dua kali, sekali saat rangka muncul dan sekali
 * saat rangka diganti.
 *
 * Dirender di server, rangkanya tidak diperlukan sama sekali: produknya sudah
 * ada di HTML pertama. Cara paling murah membuat rangka muat cocok dengan
 * isinya adalah tidak punya rangka muat.
 *
 * Saringan awal dibaca dari query string DI SERVER, jadi tautan
 * `/katalog?kategori=Rajut` yang dibagikan lewat WhatsApp sudah tersaring benar
 * di cat pertama — sebelumnya ia selalu berkedip "Semua" dulu.
 */
export default async function HalamanKatalog({
  searchParams,
}: {
  searchParams: { kategori?: string; q?: string };
}) {
  let produk: Produk[] = [];
  let gagal = false;
  try {
    produk = await produkPublik();
  } catch {
    gagal = true;
  }

  return (
    <>
      <Header />
      <main className="pt-12 sm:pt-16">
        {gagal ? (
          <div className="mx-auto max-w-sm px-5 py-24 text-center">
            <h1 className="font-display text-xl font-bold leading-snug text-ink">
              Katalog belum dapat dimuat
            </h1>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted">
              Periksa koneksi internet, kemudian muat ulang halaman ini.
            </p>
          </div>
        ) : (
          <GridProduk
            produk={produk}
            kategoriAwal={searchParams.kategori || 'Semua'}
            pencarianAwal={searchParams.q || ''}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
