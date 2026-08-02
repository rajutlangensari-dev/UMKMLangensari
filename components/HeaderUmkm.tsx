'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useAkunTampilan } from './AkunHeader';
import { normalisasiFotoUrl } from '@/lib/api';
import { IkonTas } from './Logo';

const PORTAL = [
  { href: '/', label: 'Beranda UMKM Langensari' },
  { href: '/katalog', label: 'Semua produk' },
  { href: '/umkm', label: 'Usaha warga' },
  { href: '/panduan', label: 'Panduan usaha' },
  { href: '/tentang', label: 'Tentang portal' },
];

/**
 * Header halaman usaha.
 *
 * Yang tampil paling besar adalah nama usahanya, bukan nama portal — halaman
 * ini miliknya, dan tautan yang dibagikan ke pelanggan seharusnya terasa
 * begitu. Portal desa diwakili satu tombol dropdown.
 *
 * SENGAJA TIDAK ADA NAV BAGIAN HALAMAN DI SINI. Pernah ada: satu bilah berisi
 * jangkar ke tiap blok (Tentang, Galeri, Produk, Kontak). Dibuang karena bilah
 * itu cuma menawarkan jalan pintas ke hal yang sudah terlihat saat digulir,
 * sementara satu-satunya tujuan yang benar-benar berbeda — katalog lengkapnya —
 * tidak ada di situ. Jalan ke sana sekarang tombol di dalam halamannya sendiri,
 * di tempat orang memang sedang melihat barang.
 *
 * Yang tinggal dua: nama usahanya (kembali ke halaman utamanya, jadi ini juga
 * jalan pulang dari halaman katalog dan halaman produk) dan portal desa.
 *
 * Dropdown tumbuh dari tombolnya (transform-origin: top right di globals.css),
 * bukan dari tengah dirinya sendiri. Popover yang membesar dari titik yang salah
 * terbaca seperti muncul dari tempat lain.
 */
export default function HeaderUmkm({
  nama,
  foto,
  slug,
}: {
  nama: string;
  foto: string;
  slug: string;
}) {
  const [buka, setBuka] = useState(false);
  const bungkus = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const akun = useAkunTampilan();

  useEffect(() => {
    if (!buka) return;

    function tekan(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setBuka(false);
        tombol.current?.focus();
      }
    }
    function klikLuar(e: MouseEvent) {
      if (!bungkus.current?.contains(e.target as Node)) setBuka(false);
    }
    window.addEventListener('keydown', tekan);
    window.addEventListener('pointerdown', klikLuar);
    return () => {
      window.removeEventListener('keydown', tekan);
      window.removeEventListener('pointerdown', klikLuar);
    };
  }, [buka]);

  const gambar = normalisasiFotoUrl(foto, 96);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href={`/umkm/${slug}`} className="flex min-w-0 items-center gap-3">
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface">
            {gambar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gambar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-aksen">
                {nama.charAt(0)}
              </span>
            )}
          </span>
          <span className="truncate font-display text-base font-semibold tracking-[-0.01em] text-ink">
            {nama}
          </span>
        </Link>

        <div ref={bungkus} className="relative shrink-0">
          <button
            ref={tombol}
            type="button"
            onClick={() => setBuka((v) => !v)}
            aria-expanded={buka}
            aria-controls="menu-portal"
            className="tekan flex min-h-11 items-center gap-2 rounded-full border border-line px-4 font-body text-sm text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink"
          >
            <IkonTas className="h-5 w-5 shrink-0 text-ink" />
            <span className="hidden sm:inline">UMKM Langensari</span>
            <span className="sm:hidden">Portal</span>
            <svg
              viewBox="0 0 12 8"
              aria-hidden="true"
              className={`h-2 w-3 shrink-0 transition-transform duration-200 ${buka ? 'rotate-180' : ''}`}
            >
              <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          </button>

          <nav
            id="menu-portal"
            aria-label="Navigasi portal desa"
            aria-hidden={!buka}
            data-open={buka}
            className="dropdown absolute right-0 top-full mt-2 w-64 rounded-kartu border border-line bg-paper/95 p-1.5 backdrop-blur-md"
          >
            <p className="px-3.5 pb-1 pt-2 font-body text-xs uppercase tracking-label text-muted">
              Jelajahi portal
            </p>
            {PORTAL.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                tabIndex={buka ? undefined : -1}
                onClick={() => setBuka(false)}
                className="block rounded-[10px] px-3.5 py-2.5 font-body text-sm text-ink transition-colors hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
            {/* Pintu akun ikut di sini, urutannya sama dengan header portal.
                Pemilik usaha yang sedang melihat halamannya sendiri lalu
                menemukan salah ketik tidak perlu mengetik alamat panel dari
                ingatan. Isinya berganti sendiri begitu ia sudah masuk. */}
            <Link
              href={akun ? '/kelola' : '/masuk'}
              tabIndex={buka ? undefined : -1}
              onClick={() => setBuka(false)}
              className="mt-1 block border-t border-line px-3.5 py-2.5 pt-3 font-body text-sm text-ink transition-colors hover:bg-surface"
            >
              {akun ? `Panel ${akun.nama}` : 'Masuk sebagai pengelola'}
            </Link>
            <div className="flex items-center justify-between border-t border-line px-3.5 pb-1 pt-3">
              <span className="font-body text-sm text-muted">Tampilan</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
