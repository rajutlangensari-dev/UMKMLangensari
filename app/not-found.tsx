import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Tanpa berkas ini, salah ketik alamat memunculkan halaman 404 bawaan Next.js:
// berbahasa Inggris, tanpa navigasi, dan di luar desain situs.
export default function TidakDitemukan() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-ink">
          Halaman ini tidak ada
        </h1>
        <p className="mt-3 font-body leading-relaxed text-muted text-pretty">
          Alamatnya mungkin salah ketik. Coba mulai dari katalog.
        </p>
        <Link
          href="/katalog"
          className="tekan mt-7 rounded-full bg-olive px-7 py-3 font-body text-sm font-semibold text-olive-ink transition-[transform,background-color] duration-150 ease-out hover:bg-olive-strong"
        >
          Lihat produk
        </Link>
      </main>
      <Footer />
    </>
  );
}
