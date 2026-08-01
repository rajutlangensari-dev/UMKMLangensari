import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Tentang',
  description: 'UMKM Langensari dan tim yang menjalankannya.',
};

// Halaman ini sengaja TIDAK lagi membaca sheet `Profil`.
//
// Dulu isinya profil satu toko rajut, karena situs ini memang toko rajut. Setelah
// naik jadi portal desa, profil toko itu pindah ke halaman UMKM-nya sendiri di
// /umkm/rajut-langensari. Yang tersisa di sini keterangan tentang portalnya, dan
// itu tidak diedit siapa pun lewat panel — jadi tidak ada gunanya mengambilnya
// dari sheet. Seluruh state pemuatan dan penanganan galatnya ikut hilang.
//
// TEKS DI BAWAH BELUM DIPERIKSA PIC. Isinya hanya hal yang sudah pasti: tidak ada
// klaim jumlah UMKM, dampak, atau capaian, karena angka-angka itu belum
// terverifikasi. Silakan diganti PIC atau GPT.
export default function HalamanTentang() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
          Tentang portal ini
        </h1>

        <div className="mt-6 space-y-5 font-body leading-relaxed text-muted text-pretty">
          <p>
            UMKM Langensari adalah katalog bersama untuk usaha yang dijalankan
            warga Desa Langensari, Kecamatan Sukaraja. Setiap usaha punya halamannya
            sendiri berisi profil dan produk yang dijual.
          </p>
          <p>
            Portal ini tidak menjual apa pun dan tidak memungut biaya. Tidak ada
            keranjang belanja dan tidak ada pembayaran di situs. Setiap produk
            mencantumkan harga dan nomor WhatsApp pembuatnya, dan pemesanan terjadi
            langsung antara pembeli dan pemilik usaha.
          </p>
          <p>
            Portal ini dikembangkan oleh <strong className="font-semibold text-ink">
            KKN 45 Universitas Padjadjaran</strong> bersama pemerintah Desa
            Langensari, dan dirancang supaya bisa diteruskan perangkat desa setelah
            masa KKN berakhir.
          </p>
        </div>

        <section className="sembul mt-10 rounded-kartu border border-line p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Ingin usaha Anda masuk di sini?
          </h2>
          <p className="mt-2 font-body text-sm leading-relaxed text-muted text-pretty">
            Pendaftaran dibantu tim KKN dan perangkat desa, tidak lewat formulir di
            situs ini. Panduan menyiapkan usaha, mulai dari NIB sampai toko online
            dan QRIS, ada di halaman panduan.
          </p>
          <Link
            href="/panduan"
            className="tekan mt-5 inline-block rounded-full bg-aksen px-6 py-2.5 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
          >
            Buka panduan usaha
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
