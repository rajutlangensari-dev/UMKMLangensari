import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { PenyediaKabar } from '@/components/Pemberitahuan';
import { sesiSaatIni } from '@/lib/sesi';
import { ambilUmkmSemua } from '@/lib/backend';
import Sidebar, { type Butir } from './Sidebar';
import TombolKeluar from './TombolKeluar';
import {
  IkonAkun,
  IkonBeranda,
  IkonHalaman,
  IkonProduk,
  IkonProfil,
  IkonSandi,
  IkonUmkm,
} from './ikon';

// Panel tidak boleh masuk hasil pencarian. Berlaku untuk semua halaman di
// bawahnya, jadi cukup ditulis sekali di sini.
export const metadata = { robots: { index: false, follow: false } };

/**
 * Gerbang panel pengelolaan, sekaligus kerangka bersama semua halamannya.
 *
 * Ini gerbang yang sebenarnya, dan sengaja BUKAN middleware. Middleware
 * Next.js 14 berjalan di runtime Edge, tempat `node:crypto` tidak tersedia,
 * jadi tanda tangan cookie tidak bisa diperiksa di sana — yang bisa dilakukan
 * hanyalah melihat apakah cookie-nya ada, dan cookie palsu pun lolos.
 *
 * Layout berjalan di runtime Node dan memeriksa tanda tangannya sungguhan.
 * Setiap halaman di bawah `/kelola` otomatis terlindungi tanpa perlu menulis
 * pemeriksaan sendiri-sendiri.
 *
 * Catatan: layout melindungi TAMPILAN. Setiap Route Handler yang MENULIS data
 * tetap harus memeriksa sesinya sendiri lewat `lib/otorisasi.ts` — permintaan
 * bisa dikirim langsung ke `/api/...` tanpa pernah membuka halaman mana pun.
 */
export default async function LayoutKelola({ children }: { children: React.ReactNode }) {
  const sesi = sesiSaatIni();
  if (!sesi) redirect('/masuk');

  const superAdmin = sesi.peran === 'admin';

  // Nama usaha dipakai di judul panel. Gagal memuatnya tidak boleh membuat
  // seluruh panel ikut gagal — pemiliknya tetap perlu bisa masuk dan bekerja.
  let namaUsaha = '';
  let slugUsaha = '';
  if (!superAdmin) {
    try {
      const semua = await ambilUmkmSemua();
      const milik = semua.find((u) => u.id === sesi.umkmId);
      namaUsaha = milik?.nama ?? '';
      slugUsaha = milik?.slug ?? '';
    } catch {
      namaUsaha = '';
    }
  }

  // Butir yang halamannya akan menolak penggunanya tidak ditampilkan sama
  // sekali. Menampilkan tautan yang berujung pengalihan adalah cara mengajari
  // orang bahwa sebagian menu memang tidak bisa dipercaya.
  //
  // Dikelompokkan supaya daftar lima butir tidak dibaca ulang dari atas tiap
  // kunjungan: yang mengubah ISI portal di satu kumpulan, yang mengatur SIAPA
  // dan setelan pribadi di kumpulan lain. Urutannya tetap sama persis dengan
  // sebelumnya — orang menghafal tempat, dan menggeser butir yang sudah
  // dihafal lebih mahal daripada manfaat pengelompokannya.
  const butir: Butir[] = superAdmin
    ? [
        { href: '/kelola', label: 'Beranda', ikon: <IkonBeranda /> },
        { href: '/kelola/produk', label: 'Produk', ikon: <IkonProduk />, grup: 'Isi portal' },
        { href: '/kelola/umkm', label: 'Pelaku usaha', ikon: <IkonUmkm /> },
        { href: '/kelola/akun', label: 'Akun', ikon: <IkonAkun />, grup: 'Akses' },
        { href: '/kelola/sandi', label: 'Kata sandi', ikon: <IkonSandi /> },
      ]
    : [
        { href: '/kelola', label: 'Beranda', ikon: <IkonBeranda /> },
        { href: '/kelola/produk', label: 'Produk saya', ikon: <IkonProduk />, grup: 'Usaha saya' },
        { href: '/kelola/halaman', label: 'Halaman saya', ikon: <IkonHalaman /> },
        { href: '/kelola/profil', label: 'Profil usaha', ikon: <IkonProfil /> },
        { href: '/kelola/sandi', label: 'Kata sandi', ikon: <IkonSandi />, grup: 'Akun saya' },
      ];

  return (
    <PenyediaKabar>
      <Header />
      <div className="panel-kelola mx-auto min-h-[70vh] max-w-6xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:py-10">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
              {superAdmin ? 'Kelola portal' : `Kelola ${namaUsaha || 'usaha saya'}`}
            </h1>
            <p className="mt-1.5 font-body text-base text-muted sm:text-sm">
              Masuk sebagai {sesi.namaPengguna}
              {superAdmin ? ' · super admin' : ''}
            </p>
          </div>
          <div className={`grid w-full gap-2 sm:flex sm:w-auto ${slugUsaha ? 'grid-cols-1 min-[390px]:grid-cols-2' : 'grid-cols-1'}`}>
            {slugUsaha && (
              <Link
                href={`/umkm/${slugUsaha}`}
                className="tekan flex min-h-12 items-center justify-center rounded-full border border-line px-4 font-body text-base text-muted transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen hover:text-ink sm:min-h-11 sm:px-5 sm:text-sm"
              >
                Lihat halaman saya
              </Link>
            )}
            <TombolKeluar />
          </div>
        </div>

        <div className="mt-4 grid gap-5 sm:mt-7 sm:gap-7 lg:grid-cols-[15rem_1fr] lg:gap-10">
          <aside className="sticky top-16 z-30 -mx-4 border-y border-line bg-paper px-4 py-3 sm:-mx-8 sm:px-8 lg:top-24 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
            <Sidebar butir={butir} />
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </PenyediaKabar>
  );
}
