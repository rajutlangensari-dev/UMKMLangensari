'use client';

import { useState } from 'react';

export default function TombolKeluar() {
  const [sibuk, setSibuk] = useState(false);

  async function keluar() {
    if (sibuk) return;
    setSibuk(true);
    try {
      await fetch('/api/keluar', { method: 'POST' });
      // Muat ulang penuh, bukan router.push: cookie dihapus di sisi respons, dan
      // cache router masih memegang halaman versi "sudah masuk".
      window.location.href = '/';
    } catch {
      setSibuk(false);
    }
  }

  return (
    <button
      type="button"
      onClick={keluar}
      disabled={sibuk}
      className="tekan flex min-h-12 w-full shrink-0 items-center justify-center rounded-full border border-line px-4 font-body text-base text-muted transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen hover:text-ink disabled:opacity-60 sm:min-h-11 sm:w-auto sm:px-5 sm:text-sm"
    >
      {sibuk ? 'Keluar...' : 'Keluar'}
    </button>
  );
}
