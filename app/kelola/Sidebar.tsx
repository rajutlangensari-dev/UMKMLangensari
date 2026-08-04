'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';

/**
 * Navigasi panel.
 *
 * Menggantikan baris pil mendatar yang dulu ada di `NavKelola`. Pil itu
 * membungkus ke baris kedua di layar sempit, dan posisi tiap butir jadi berubah
 * menurut lebar layar. Orang menghafal TEMPAT, bukan nama — begitu tempatnya
 * bergerak, tiap kunjungan berarti membaca ulang seluruh daftarnya.
 *
 * Di ≥1024px sidebar menempel; di bawah itu jadi laci. Laci punya perangkap
 * fokus sendiri karena `<dialog>` tidak dipakai di sini: laci harus bisa
 * berdampingan dengan isi halaman di layar lebar tanpa berubah jadi modal.
 */

export interface Butir {
  href: string;
  label: string;
  ikon: React.ReactNode;
  /**
   * Judul kelompok yang muncul DI ATAS butir ini. Cukup ditulis di butir
   * pertama tiap kelompok; sisanya mewarisi dengan tidak menyebutkannya.
   */
  grup?: string;
}

export default function Sidebar({ butir }: { butir: Butir[] }) {
  const jalur = usePathname();
  const [buka, setBuka] = useState(false);
  const laci = useRef<HTMLDivElement>(null);
  const pemicu = useRef<HTMLButtonElement>(null);

  // Berpindah halaman menutup laci. Tanpa ini, laci tetap menutupi halaman yang
  // baru saja dibuka penggunanya.
  useEffect(() => setBuka(false), [jalur]);

  useEffect(() => {
    if (!buka) return;

    // Saat laci terbuka, halaman di belakang tidak ikut bergerak ketika jari
    // menggulir menu. Nilai sebelumnya dipulihkan supaya tidak mengganggu
    // dialog atau halaman lain yang juga mengatur gulir badan dokumen.
    const overflowSebelum = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function tekan(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBuka(false);
        pemicu.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !laci.current) return;

      // Perangkap fokus. Tanpa ini, Tab keluar dari laci ke halaman di
      // belakangnya yang sedang tertutup tirai — fokus jadi berada di tempat
      // yang tidak terlihat, dan pengguna papan ketik kehilangan jejaknya.
      const bisa = laci.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (bisa.length === 0) return;
      const awal = bisa[0];
      const akhir = bisa[bisa.length - 1];
      if (e.shiftKey && document.activeElement === awal) {
        e.preventDefault();
        akhir.focus();
      } else if (!e.shiftKey && document.activeElement === akhir) {
        e.preventDefault();
        awal.focus();
      }
    }

    window.addEventListener('keydown', tekan);
    laci.current?.querySelector<HTMLElement>('a[href]')?.focus();
    return () => {
      window.removeEventListener('keydown', tekan);
      document.body.style.overflow = overflowSebelum;
    };
  }, [buka]);

  const butirAktif =
    butir.find((b) => (b.href === '/kelola' ? jalur === b.href : jalur.startsWith(b.href))) ??
    butir[0];

  // Judul kelompok memecah daftar tujuh butir jadi dua-tiga kumpulan pendek.
  // Daftar rata tanpa jeda dibaca dari atas ke bawah setiap kali; daftar
  // berkelompok cukup dibaca judulnya, lalu mata langsung turun ke bagian yang
  // benar. Bedanya paling terasa bagi yang membuka panel ini seminggu sekali.
  const isi = (
    <nav aria-label="Navigasi panel" className="flex flex-col gap-1">
      {butir.map((b) => {
        // `/kelola` cocok persis saja; kalau memakai awalan, ia akan ikut aktif
        // di setiap halaman anaknya dan dua butir menyala bersamaan.
        const aktif = b.href === '/kelola' ? jalur === b.href : jalur.startsWith(b.href);
        const judulGrup = b.grup && (
          <p
            key={`grup-${b.grup}`}
            className="mb-1 mt-5 px-4 font-body text-sm sm:text-xs font-semibold uppercase tracking-[0.12em] text-muted first:mt-0 lg:mt-4 lg:text-[11px]"
          >
            {b.grup}
          </p>
        );
        return (
          <Fragment key={b.href}>
          {judulGrup}
          <Link
            href={b.href}
            aria-current={aktif ? 'page' : undefined}
            className={`tekan flex min-h-12 items-center gap-3 rounded-full px-4 font-body text-base transition-[transform,color,background-color] duration-150 ease-out lg:min-h-11 lg:text-sm ${
              aktif ? 'bg-aksen font-semibold text-aksen-ink' : 'text-muted hover:bg-surface hover:text-ink'
            }`}
          >
            <span aria-hidden="true" className="shrink-0">
              {b.ikon}
            </span>
            {b.label}
          </Link>
          </Fragment>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Layar lebar: menempel, selalu terlihat. */}
      <div className="hidden lg:block">{isi}</div>

      {/* Layar sempit: tombol + laci. */}
      <button
        ref={pemicu}
        type="button"
        onClick={() => setBuka(true)}
        aria-expanded={buka}
        aria-controls="laci-panel"
        aria-label={`Buka menu pengelolaan. Halaman saat ini: ${butirAktif?.label ?? 'Panel'}`}
        className="tekan flex min-h-12 w-full items-center gap-3 rounded-full border border-line bg-surface px-4 font-body text-base text-ink transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen lg:hidden"
      >
        <svg viewBox="0 0 16 12" aria-hidden="true" className="h-3 w-4">
          <path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="font-semibold">Menu pengelolaan</span>
        <span className="ml-auto truncate text-base sm:text-sm text-muted">{butirAktif?.label}</span>
      </button>

      <div
        data-open={buka}
        onClick={() => setBuka(false)}
        aria-hidden="true"
        className="tirai fixed inset-0 z-50 bg-black/40 lg:hidden"
      />
      <div
        ref={laci}
        id="laci-panel"
        aria-hidden={!buka}
        data-open={buka}
        className="laci fixed inset-y-0 left-0 z-[60] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain border-r border-line bg-paper px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] lg:hidden"
      >
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="font-display text-base font-semibold text-ink">Menu pengelolaan</span>
          <button
            type="button"
            onClick={() => {
              setBuka(false);
              pemicu.current?.focus();
            }}
            aria-label="Tutup menu"
            className="tekan flex h-12 w-12 items-center justify-center rounded-full text-muted hover:text-ink sm:h-11 sm:w-11"
          >
            <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3.5 w-3.5">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
        {isi}
      </div>
    </>
  );
}
