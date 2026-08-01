import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { wajibSesi } from '@/lib/sesi';
import FormUmkmBaru from './FormUmkmBaru';

export const metadata = { title: 'Daftarkan usaha' };

export default function HalamanUmkmBaru() {
  const sesi = wajibSesi();
  // Peran umkm tidak boleh mendaftarkan usaha lain. Layout /kelola hanya
  // memastikan sudah masuk; pembatasan perannya di sini. Jalur tulisnya sendiri
  // dijaga terpisah di /api/umkm, jadi menebak alamat halaman ini tidak cukup.
  if (sesi.peran !== 'admin') redirect('/kelola');

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70vh] max-w-2xl px-5 py-12 sm:px-8">
        <Link
          href="/kelola"
          className="font-body text-sm text-muted transition-colors hover:text-ink"
        >
          Kembali ke kelola
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
          Daftarkan usaha
        </h1>
        <p className="mt-1.5 font-body text-sm text-muted">
          Membuat halaman usaha sekaligus akun pemiliknya.
        </p>
        <FormUmkmBaru />
      </main>
    </>
  );
}
