'use client';

import { useEffect, useState } from 'react';

type Tema = 'terang' | 'gelap';

export default function ThemeToggle() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const tersimpan = localStorage.getItem('tema') as Tema | null;
    const sistemGelap = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTema(tersimpan ?? (sistemGelap ? 'gelap' : 'terang'));
  }, []);

  function ganti() {
    const baru: Tema = tema === 'gelap' ? 'terang' : 'gelap';
    setTema(baru);
    localStorage.setItem('tema', baru);
    document.documentElement.setAttribute('data-theme', baru);
  }

  return (
    <button
      type="button"
      onClick={ganti}
      aria-label={tema === 'gelap' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      className="rounded-full border border-ink/25 px-4 py-1.5 font-body text-[0.66rem] uppercase tracking-label text-ink/70 transition-colors hover:border-brick hover:text-brick"
    >
      {/* Simbol tetap stabil sebelum tema terbaca supaya tidak melompat saat hydrate. */}
      {tema === 'gelap' ? 'Terang' : 'Gelap'}
    </button>
  );
}
