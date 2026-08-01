'use client';

import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import AkunHeader, { AkunMenuMobile } from './AkunHeader';

const LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/umkm', label: 'Usaha warga' },
  { href: '/panduan', label: 'Panduan' },
  { href: '/tentang', label: 'Tentang' },
];

// Pita pengumuman aksen di atas header dibuang. Warna pekat di baris paling atas
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

        <div className="hidden items-center gap-7 md:flex">
          <nav aria-label="Navigasi utama" className="flex items-center gap-8">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="tautan-nav font-body text-sm text-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Garis pemisah. Yang di kanannya bukan navigasi isi situs melainkan
              perkakas — pintu masuk pengelola dan setelan tampilan. Tanpa
              pemisah, "Masuk" terbaca sebagai halaman keenam yang setara dengan
              Katalog, padahal pengunjung biasa tidak pernah membutuhkannya. */}
          <span aria-hidden="true" className="h-5 w-px bg-line" />

          {/* Pintu akun. Belum masuk jadi tombol "Masuk"; sudah masuk jadi avatar
              yang membuka menu akun.

              SENGAJA TERLIHAT, bukan disembunyikan: `/masuk` memang rute publik,
              dan yang menjaganya kata sandi plus penguncian setelah beberapa
              kali gagal — bukan sulitnya menemukan tautan. Menyembunyikannya
              hanya menyulitkan pemilik UMKM yang berhak.

              Bukan tombol aksen pekat: yang membukanya belasan orang, sementara
              yang melihatnya semua pengunjung. Ajakan utama halaman ini adalah
              melihat barang, bukan masuk panel. */}
          <AkunHeader />

          <ThemeToggle />
        </div>

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
        {/* Di HP urutannya sama dengan di layar lebar: akun dulu, lalu setelan
            tampilan paling bawah. Dua-duanya di bawah garis, terpisah dari
            daftar halaman. */}
        <AkunMenuMobile onTutup={() => setBuka(false)} />
        <div data-menu-item className="flex items-center justify-between border-t border-line py-3.5">
          <span className="font-body text-muted">Tampilan</span>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
