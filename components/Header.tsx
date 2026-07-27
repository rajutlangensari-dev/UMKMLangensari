'use client';

import { useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

// Link absolut supaya tetap jalan saat dibuka dari halaman mana pun.
const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/panduan', label: 'Panduan' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/#kontak', label: 'Kontak' },
];

export default function Header() {
  const [buka, setBuka] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* Pita atas: keterangan asal barang dan cara pesan, bukan promo palsu. */}
      <div className="bg-olive px-6 py-2 text-center">
        <p className="font-body text-[0.68rem] uppercase tracking-label text-olive-ink/85">
          Produk lokal Langensari. Pesan langsung melalui WhatsApp.
        </p>
      </div>

      <div className="border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-body text-[0.7rem] uppercase tracking-label text-ink/70 transition-colors hover:text-brick"
              >
                {l.label}
              </a>
            ))}
            <ThemeToggle />
          </nav>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setBuka((v) => !v)}
              aria-expanded={buka}
              aria-controls="navigasi-mobile"
              className="rounded-full border border-ink/25 px-4 py-1.5 font-body text-[0.68rem] uppercase tracking-label text-ink/80 transition-colors active:scale-[0.97]"
            >
              {buka ? 'Tutup' : 'Menu'}
            </button>
          </div>
        </div>

        {buka && (
          <nav
            id="navigasi-mobile"
            aria-label="Navigasi mobile"
            className="border-t border-ink/10 bg-paper px-5 py-1 md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setBuka(false)}
                className="block border-b border-ink/8 py-3.5 font-body text-sm uppercase tracking-label text-ink/80 last:border-0"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/admin"
              onClick={() => setBuka(false)}
              className="block py-3.5 font-body text-sm uppercase tracking-label text-ink/65"
            >
              Admin
            </a>
            <div className="flex items-center justify-between border-t border-ink/10 py-3.5">
              <span className="font-body text-sm uppercase tracking-label text-ink/65">
                Tampilan
              </span>
              <ThemeToggle />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
