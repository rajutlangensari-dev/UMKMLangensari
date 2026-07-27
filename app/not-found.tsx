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
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.02em] text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-4 font-body leading-relaxed text-ink/70 text-pretty">
          Alamat yang dibuka tidak ada di situs ini. Kemungkinan salah ketik atau
          halamannya sudah dipindahkan.
        </p>
        <Link
          href="/katalog"
          className="mt-8 rounded-full bg-brick px-8 py-3.5 font-body text-[0.7rem] font-semibold uppercase tracking-label text-brick-ink transition-colors hover:bg-brick-strong"
        >
          Lihat katalog
        </Link>
      </main>
      <Footer />
    </>
  );
}
