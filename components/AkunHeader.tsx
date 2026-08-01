'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Peran } from '@/lib/types';
import { inisial, tampilanDariDokumen, type Tampilan } from '@/lib/tampilan';

/**
 * Pintu akun di header, seperti di media sosial.
 *
 * Belum masuk  -> tombol "Masuk".
 * Sudah masuk  -> avatar berisi huruf awal nama, yang membuka menu akun.
 *
 * Sesinya dibaca DI PERAMBAN, dari cookie tampilan — lihat `lib/tampilan.ts`
 * untuk alasan lengkapnya. Ringkasnya: membacanya di server akan memaksa
 * `/panduan` (halaman tujuan QR yang sudah tercetak) berubah dari statis jadi
 * dinamis, dan itu harga yang terlalu mahal untuk satu tombol.
 *
 * Konsekuensinya yang harus diterima: render pertama selalu "Masuk", lalu
 * berganti jadi avatar setelah hidrasi. Bagi pengunjung biasa — yang jumlahnya
 * hampir seluruh lalu lintas — tidak ada yang berubah sama sekali. Yang melihat
 * pergantian itu cuma belasan pengelola, sekali tiap membuka halaman.
 *
 * Render pertama TIDAK BOLEH menebak. Kalau komponen ini mencoba merender
 * avatar sebelum cookie terbaca, HTML server dan HTML klien akan berbeda dan
 * React membuang seluruh pohonnya sambil mengeluh soal hidrasi.
 */
export default function AkunHeader() {
  const akun = useAkunTampilan();
  const [buka, setBuka] = useState(false);
  const bungkus = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);

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

  if (!akun) return <TombolMasuk />;

  return (
    <div ref={bungkus} className="relative">
      <button
        ref={tombol}
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        aria-controls="menu-akun"
        aria-label={`Menu akun ${akun.nama}`}
        className="tekan avatar-akun"
      >
        {inisial(akun.nama)}
      </button>

      <nav
        id="menu-akun"
        aria-label="Menu akun"
        aria-hidden={!buka}
        data-open={buka}
        className="dropdown absolute right-0 top-full mt-2 w-60 rounded-kartu border border-line bg-paper/95 p-1.5 backdrop-blur-md"
      >
        <div className="border-b border-line px-3.5 pb-3 pt-2.5">
          <p className="truncate font-display text-sm font-semibold text-ink">{akun.nama}</p>
          <p className="mt-0.5 font-body text-xs text-muted">{LABEL_PERAN[akun.peran]}</p>
        </div>

        {BUTIR[akun.peran].map((b) => (
          <Link
            key={b.href}
            href={b.href}
            tabIndex={buka ? undefined : -1}
            onClick={() => setBuka(false)}
            className="mt-0.5 block rounded-[10px] px-3.5 py-2.5 font-body text-sm text-ink transition-colors hover:bg-surface"
          >
            {b.label}
          </Link>
        ))}

        <div className="mt-1 border-t border-line pt-1">
          <button
            type="button"
            tabIndex={buka ? undefined : -1}
            onClick={keluar}
            className="block w-full rounded-[10px] px-3.5 py-2.5 text-left font-body text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            Keluar
          </button>
        </div>
      </nav>
    </div>
  );
}

/**
 * Versi menu HP: bukan dropdown, melainkan butir-butir di dalam menu yang sudah
 * terbuka. Daftar butirnya dibagi dengan versi desktop supaya menu akun tidak
 * berisi hal berbeda menurut lebar layar — itu jenis perbedaan yang tidak ada
 * yang menyadarinya sampai seseorang mencari sesuatu di HP dan tidak menemukan.
 */
export function AkunMenuMobile({ onTutup }: { onTutup: () => void }) {
  const akun = useAkunTampilan();

  if (!akun) {
    return (
      <Link
        href="/masuk"
        onClick={onTutup}
        data-menu-item
        className="flex items-center gap-2.5 border-t border-line py-3.5 font-body text-ink"
      >
        <IkonMasuk />
        Masuk sebagai pengelola
      </Link>
    );
  }

  return (
    <>
      <div data-menu-item className="flex items-center gap-3 border-t border-line py-3.5">
        <span className="avatar-akun avatar-akun-mati">{inisial(akun.nama)}</span>
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-semibold text-ink">
            {akun.nama}
          </span>
          <span className="block font-body text-xs text-muted">{LABEL_PERAN[akun.peran]}</span>
        </span>
      </div>
      {BUTIR[akun.peran].map((b) => (
        <Link
          key={b.href}
          href={b.href}
          onClick={onTutup}
          data-menu-item
          className="block border-t border-line py-3.5 font-body text-ink"
        >
          {b.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={keluar}
        data-menu-item
        className="block w-full border-t border-line py-3.5 text-left font-body text-muted"
      >
        Keluar
      </button>
    </>
  );
}

/**
 * Siapa yang sedang masuk, atau null.
 *
 * Nilai awalnya SELALU null, bahkan kalau cookie-nya jelas-jelas ada: render
 * pertama di peramban harus sama persis dengan yang dikirim server, dan server
 * tidak pernah membaca cookie ini.
 */
export function useAkunTampilan(): Tampilan | null {
  const [akun, setAkun] = useState<Tampilan | null>(null);
  useEffect(() => setAkun(tampilanDariDokumen()), []);
  return akun;
}

/** Tombol untuk yang belum masuk. Dipakai juga saat cookie tampilan tidak ada. */
export function TombolMasuk() {
  return (
    <Link
      href="/masuk"
      className="tekan inline-flex min-h-9 items-center gap-2 rounded-full border border-line px-4 font-body text-sm text-ink transition-[transform,border-color,background-color] duration-150 ease-out hover:border-aksen hover:bg-surface"
    >
      <IkonMasuk />
      Masuk
    </Link>
  );
}

export async function keluar() {
  await fetch('/api/keluar', { method: 'POST' });
  // Muat ulang penuh, bukan router.push: cookie dihapus di sisi respons, dan
  // cache router masih memegang halaman versi "sudah masuk".
  window.location.href = '/';
}

const LABEL_PERAN: Record<Peran, string> = {
  admin: 'Pengelola portal',
  umkm: 'Pemilik usaha',
};

/**
 * Isi menu per peran. Pendek dengan sengaja — menu akun bukan salinan sidebar
 * panel. Yang di sini cuma jalan pintas yang benar-benar dipakai dari halaman
 * publik; sisanya ada di dalam panel, satu ketukan lebih jauh.
 */
const BUTIR: Record<Peran, { href: string; label: string }[]> = {
  admin: [
    { href: '/kelola', label: 'Dasbor panel' },
    { href: '/kelola/produk', label: 'Kelola produk' },
    { href: '/kelola/umkm', label: 'Pelaku usaha' },
    { href: '/kelola/sandi', label: 'Ganti kata sandi' },
  ],
  umkm: [
    { href: '/kelola', label: 'Dasbor panel' },
    { href: '/kelola/produk', label: 'Produk saya' },
    { href: '/kelola/halaman', label: 'Susun halaman' },
    { href: '/kelola/profil', label: 'Profil usaha' },
    { href: '/kelola/sandi', label: 'Ganti kata sandi' },
  ],
};

export function IkonMasuk() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path
        d="M14.5 3.5h4a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="m9.5 16.5 4.5-4.5-4.5-4.5M14 12H3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
