import { adaIsi, type Blok, type TataLetak } from '@/lib/blok';
import type { Produk, Umkm } from '@/lib/types';
import Hero from './Hero';
import Cerita from './Cerita';
import Keunggulan from './Keunggulan';
import Fakta from './Fakta';
import Galeri from './Galeri';
import Katalog from './Katalog';
import Kontak from './Kontak';

/**
 * Perender satu blok. Peta jenis → komponen, bukan rantai kondisi.
 *
 * Jenis yang tidak dikenal MENGEMBALIKAN null, bukan melempar. Halaman yang
 * disusun versi lebih baru tetap tayang di versi lama, cuma tanpa blok yang
 * belum dikenalnya. Kalau di sini melempar, satu blok masa depan akan
 * menjatuhkan seluruh halaman usaha itu.
 *
 * Tidak ada satu pun komponen di bawah yang memakai dangerouslySetInnerHTML.
 * Isi blok datang dari sheet yang bisa disunting tangan, jadi ia teks — selamanya.
 */

export interface KonteksBlok {
  umkm: Umkm;
  produk: Produk[];
  produkGagal: boolean;
  tataLetak: TataLetak;
}

export default function RenderBlok({
  blok,
  konteks,
  jangkar,
}: {
  blok: Blok;
  konteks: KonteksBlok;
  /** Id jangkar bagian ini, sasaran tautan `#produk`. Kosong di pratinjau penyunting. */
  jangkar?: string;
}) {
  // Satu penjagaan di sini, bukan tujuh salinan di tujuh komponen.
  if (!adaIsi(blok, konteks.umkm)) return null;

  const isi = (() => {
    switch (blok.jenis) {
      case 'hero':
        return <Hero blok={blok} konteks={konteks} />;
      case 'cerita':
        return <Cerita blok={blok} />;
      case 'keunggulan':
        return <Keunggulan blok={blok} />;
      case 'fakta':
        return <Fakta blok={blok} />;
      case 'galeri':
        return <Galeri blok={blok} />;
      case 'katalog':
        return <Katalog blok={blok} konteks={konteks} />;
      case 'kontak':
        return <Kontak blok={blok} konteks={konteks} />;
      default:
        return null;
    }
  })();

  if (!isi || !jangkar) return isi;

  // Jangkar dipasang di pembungkus, bukan di dalam tiap komponen blok. Kalau
  // tiap blok memasangnya sendiri, tujuh berkas harus tahu soal jangkar — dan
  // yang kedelapan akan lupa.
  //
  // `scroll-mt` menjaga judul bagian tidak tertutup header yang menempel saat
  // dilompati. Tanpa itu, tombol sampul "Lihat produk" mendarat di posisi yang
  // judulnya sudah hilang di balik header.
  return (
    <div id={jangkar} className="scroll-mt-16">
      {isi}
    </div>
  );
}

/** Pembungkus seragam supaya jarak antarblok tidak diputuskan tujuh kali. */
export function Bagian({
  anak,
  lebar = 'max-w-6xl',
  rapat,
}: {
  anak: React.ReactNode;
  lebar?: string;
  rapat?: boolean;
}) {
  return (
    <section className={`sembul mx-auto ${lebar} px-5 ${rapat ? 'py-10' : 'py-14 sm:py-20'} sm:px-8`}>
      {anak}
    </section>
  );
}

export function JudulBagian({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">
      {children}
    </h2>
  );
}
