'use client';

import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/panduan', label: 'Panduan' },
  { href: '/tentang', label: 'Tentang' },
];

// Pita pengumuman olive di atas header dibuang. Warna pekat di baris paling atas
// menarik mata ke keterangan yang tidak bisa diklik, padahal yang perlu ditemukan
// lebih dulu adalah menu Katalog.
export default function Header() {
  const [buka, setBuka] = useState(false);
  const tombolMenuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buka) return;
    function tutupDenganEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setBuka(false);
        tombolMenuRef.current?.focus();
      }
    }
    window.addEventListener('keydown', tutupDenganEscape);
    return () => window.removeEventListener('keydown', tutupDenganEscape);
  }, [buka]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="tautan-nav font-body text-sm text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        <div className="md:hidden">
          <button
            ref={tombolMenuRef}
            type="button"
            onClick={() => setBuka((v) => !v)}
            aria-expanded={buka}
            aria-controls="navigasi-mobile"
            aria-label={buka ? 'Tutup menu' : 'Buka menu'}
            className="tekan tombol-menu relative flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink"
          >
            <span aria-hidden="true" className="relative block h-4 w-5">
              <span className="garis-menu garis-menu-atas" />
              <span className="garis-menu garis-menu-tengah" />
              <span className="garis-menu garis-menu-bawah" />
            </span>
          </button>
        </div>
      </div>

      <nav
        id="navigasi-mobile"
        aria-label="Navigasi mobile"
        aria-hidden={!buka}
        data-open={buka}
        className="menu-mobile absolute inset-x-0 top-full border-t border-line bg-paper/95 px-5 py-1 backdrop-blur-md md:hidden"
      >
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setBuka(false)}
            data-menu-item
            className="block border-b border-line py-3.5 font-body text-ink last:border-0"
          >
            {l.label}
          </a>
        ))}
        <div data-menu-item className="flex items-center justify-between border-t border-line py-3.5">
          <span className="font-body text-muted">Tampilan</span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
