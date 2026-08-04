import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import TombolKembali from '@/components/TombolKembali';
import { wajibSesi } from '@/lib/sesi';
import { ambilUmkmSemua } from '@/lib/backend';
import { pengenalBerikutnya } from '@/lib/pengenal-umkm';
import FormUmkmBaru from './FormUmkmBaru';

export const metadata = { title: 'Daftarkan usaha' };

export default async function HalamanUmkmBaru() {
  const sesi = wajibSesi();
  // Peran umkm tidak boleh mendaftarkan usaha lain. Layout /kelola hanya
  // memastikan sudah masuk; pembatasan perannya di sini. Jalur tulisnya sendiri
  // dijaga terpisah di /api/umkm, jadi menebak alamat halaman ini tidak cukup.
  if (sesi.peran !== 'admin') redirect('/kelola');

  // Gagal memuat daftar tidak boleh menutup halaman pendaftaran. Usulannya
  // dikosongkan, isiannya tetap bisa diketik tangan, dan backend tetap menolak
  // slug yang bentrok — jadi yang hilang cuma kenyamanannya.
  let usulan = '';
  try {
    usulan = pengenalBerikutnya((await ambilUmkmSemua()).map((u) => u.slug));
  } catch {
    usulan = '';
  }

  return (
    <>
      <Header />
      <main className="mx-auto min-h-[70vh] max-w-2xl px-5 py-12 sm:px-8">
        <TombolKembali fallbackHref="/kelola/umkm" />
        <h1 className="mt-6 font-display text-2xl font-bold tracking-[-0.02em] text-ink">
          Daftarkan usaha
        </h1>
        <p className="mt-1.5 font-body text-sm text-muted">
          Membuat halaman usaha sekaligus akun pemiliknya.
        </p>
        <FormUmkmBaru pengenalBerikutnya={usulan} />
      </main>
    </>
  );
}
