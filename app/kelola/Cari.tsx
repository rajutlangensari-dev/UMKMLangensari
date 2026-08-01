'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Kotak cari untuk daftar panel.
 *
 * Kata kuncinya tinggal di parameter URL, bukan di state komponen saja. Dengan
 * begitu memuat ulang halaman, menekan tombol kembali, atau menempelkan
 * tautannya ke orang lain tidak menghilangkan saringannya.
 *
 * PENTING: ini menyaring data yang SUDAH boleh diterima peran itu. Penyaringan
 * menurut peran dikerjakan di server sebelum data dikirim (lihat komentar di
 * `kelola/produk/page.tsx`). Kotak ini bukan pengaman; ia alat menemukan.
 */
export default function Cari({
  nama,
  label,
  awal,
}: {
  /** Nama parameter URL-nya. Beda daftar, beda nama, supaya bisa berdampingan. */
  nama: string;
  label: string;
  awal: string;
}) {
  const router = useRouter();
  const jalur = usePathname();
  const parameter = useSearchParams();
  const [nilai, setNilai] = useState(awal);

  // Diketik dulu, URL menyusul. Menulis URL tiap ketukan membuat riwayat
  // peramban penuh dan tombol kembali jadi tidak berguna.
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams(parameter.toString());
      if (nilai.trim()) p.set(nama, nilai.trim());
      else p.delete(nama);
      const q = p.toString();
      router.replace(q ? `${jalur}?${q}` : jalur, { scroll: false });
    }, 200);
    return () => clearTimeout(t);
    // `parameter` sengaja tidak ikut: ia berubah sebagai AKIBAT efek ini, dan
    // memasukkannya membuat efeknya memicu dirinya sendiri tanpa henti.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nilai, nama, jalur, router]);

  return (
    <div className="kolom-cari relative w-full sm:max-w-xs">
      <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        className="ikon-cari pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      >
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
        <path d="M11.8 11.8 16 16" stroke="currentColor" strokeWidth="1.7" />
      </svg>
      <input
        type="search"
        value={nilai}
        onChange={(e) => setNilai(e.target.value)}
        aria-label={label}
        placeholder={label}
        className="input-cari min-h-11 w-full bg-transparent py-2 pl-11 pr-11 font-body text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setNilai('')}
        data-visible={nilai.length > 0}
        aria-label="Hapus pencarian"
        tabIndex={nilai ? undefined : -1}
        className="hapus-cari absolute right-3 top-1/2 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-ink"
      >
        <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3 w-3">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
    </div>
  );
}

// `cocok()` sengaja TIDAK tinggal di berkas ini. Ia dipakai Server Component,
// dan Next.js mengubah seluruh ekspor modul `'use client'` jadi referensi klien
// yang tidak bisa dipanggil dari server. Rumahnya di `./cocok.ts`.
