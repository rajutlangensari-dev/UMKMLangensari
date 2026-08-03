'use client';

import { useState } from 'react';

/**
 * Kotak kata sandi sekali tampil.
 *
 * Kata sandi ini tidak disimpan di mana pun dan tidak bisa ditampilkan ulang —
 * yang tersimpan hanya hash scrypt-nya. Karena itu kotaknya sengaja TIDAK bisa
 * ditutup dengan Escape, klik di luar, atau tombol silang kecil di pojok:
 * satu-satunya jalan keluar adalah menekan "Sudah dicatat", supaya menutupnya
 * jadi tindakan yang disengaja, bukan refleks.
 */
export default function KartuSandi({
  nama,
  sandi,
  onTutup,
}: {
  nama: string;
  sandi: string;
  onTutup: () => void;
}) {
  const [disalin, setDisalin] = useState(false);

  async function salin() {
    try {
      await navigator.clipboard.writeText(sandi);
      setDisalin(true);
      setTimeout(() => setDisalin(false), 2000);
    } catch {
      // Clipboard API ditolak (halaman non-HTTPS, atau izin dimatikan). Bukan
      // masalah: sandinya tetap terlihat di layar dan bisa dicatat manual.
      setDisalin(false);
    }
  }

  return (
    <div className="rounded-kartu border-2 border-aksen bg-surface p-5 sm:p-6">
      <p className="font-body text-base text-muted sm:text-sm">
        Kata sandi untuk <strong className="text-ink">{nama}</strong>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <code className="angka-rata min-w-0 break-all rounded-kartu bg-paper px-4 py-3 font-display text-xl font-semibold tracking-wider text-ink">
          {sandi}
        </code>
        <button
          type="button"
          onClick={salin}
          className="tekan flex min-h-12 w-full items-center justify-center rounded-full border border-line px-5 font-body text-base text-ink transition-[transform,border-color] duration-150 ease-out hover:border-aksen sm:min-h-11 sm:w-auto sm:text-sm"
        >
          {disalin ? 'Tersalin' : 'Salin'}
        </button>
      </div>

      <p className="mt-4 font-body text-base leading-relaxed text-ink text-pretty sm:text-sm">
        Catat atau salin sekarang, lalu serahkan ke orangnya. Kata sandi ini tidak
        disimpan di mana pun dan <strong>tidak bisa dilihat lagi</strong> setelah kotak ini
        ditutup. Kalau hilang, satu-satunya jalan adalah menyetel ulang.
      </p>

      <button
        type="button"
        onClick={onTutup}
        className="tekan mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-aksen px-6 font-body text-base font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat sm:min-h-11 sm:w-auto sm:text-sm"
      >
        Sudah dicatat
      </button>
    </div>
  );
}
