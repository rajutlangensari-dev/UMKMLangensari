'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Produk } from '@/lib/types';
import KartuProduk from './KartuProduk';

export default function GridProduk({
  produk,
  kategoriAwal = 'Semua',
  pencarianAwal = '',
}: {
  produk: Produk[];
  kategoriAwal?: string;
  pencarianAwal?: string;
}) {
  const [kategoriAktif, setKategoriAktif] = useState<string>(kategoriAwal);
  const [pencarian, setPencarian] = useState(pencarianAwal);
  const inputPencarianRef = useRef<HTMLInputElement>(null);

  // Kategori dan kata pencarian ditulis balik ke alamat, jadi hasil saringan
  // bisa disalin dan dikirim lewat WhatsApp apa adanya. replaceState, bukan
  // pushState, supaya tombol kembali tidak terisi satu entri per huruf.
  useEffect(() => {
    const q = new URLSearchParams();
    if (kategoriAktif !== 'Semua') q.set('kategori', kategoriAktif);
    if (pencarian.trim()) q.set('q', pencarian.trim());
    const query = q.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }, [kategoriAktif, pencarian]);

  const daftarKategori = useMemo(() => {
    const set = new Set(produk.map((p) => p.kategori).filter(Boolean));
    return ['Semua', ...Array.from(set)];
  }, [produk]);

  const hasilFilter = useMemo(() => {
    const q = pencarian.trim().toLowerCase();
    return produk.filter((p) => {
      const cocokKategori = kategoriAktif === 'Semua' || p.kategori === kategoriAktif;
      const cocokPencarian =
        q === '' || p.namaProduk.toLowerCase().includes(q) || p.namaUmkm.toLowerCase().includes(q);
      return cocokKategori && cocokPencarian;
    });
  }, [produk, kategoriAktif, pencarian]);

  return (
    <section id="katalog" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20 sm:px-8">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
        Katalog
      </h1>
      <p className="mt-1.5 font-body text-sm text-muted" aria-live="polite">
        {hasilFilter.length} produk tersedia
      </p>

      <div className="mt-7 space-y-4">
        <div className="kolom-cari relative sm:max-w-sm">
          <label htmlFor="pencarian-produk" className="sr-only">
            Cari produk atau perajin
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="ikon-cari pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            ref={inputPencarianRef}
            id="pencarian-produk"
            type="search"
            placeholder="Cari nama produk atau perajin"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            className="input-cari w-full rounded-full bg-transparent py-3 pl-11 pr-12 font-body text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setPencarian('');
              inputPencarianRef.current?.focus();
            }}
            aria-label="Hapus pencarian"
            aria-hidden={!pencarian}
            tabIndex={pencarian ? 0 : -1}
            data-visible={Boolean(pencarian)}
            className="tekan hapus-cari absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
              <path
                d="m6 6 8 8m0-8-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex snap-x gap-2 overflow-x-auto pb-1">
          {daftarKategori.map((kategori) => (
            <button
              type="button"
              key={kategori}
              onClick={() => setKategoriAktif(kategori)}
              aria-pressed={kategoriAktif === kategori}
              className={`tekan shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 font-body text-sm transition-[transform,color,background-color,border-color] duration-150 ease-out ${
                kategoriAktif === kategori
                  ? 'bg-olive text-olive-ink'
                  : 'border border-line text-muted hover:border-olive hover:text-ink'
              }`}
            >
              {kategori}
            </button>
          ))}
        </div>
      </div>

      {hasilFilter.length === 0 ? (
        <div className="mx-auto max-w-sm py-20 text-center">
          <p className="font-display text-lg font-semibold text-ink">Tidak ada yang cocok</p>
          <p className="mt-2 font-body text-sm leading-relaxed text-muted">
            Coba kata lain, atau kembalikan pilihan ke semua kategori.
          </p>
          <button
            type="button"
            onClick={() => {
              setPencarian('');
              setKategoriAktif('Semua');
            }}
            className="tekan mt-6 rounded-full bg-olive px-6 py-2.5 font-body text-sm font-semibold text-olive-ink transition-[transform,background-color] duration-150 ease-out hover:bg-olive-strong"
          >
            Tampilkan semua
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {hasilFilter.map((p, i) => (
            <KartuProduk key={p.id} produk={p} indeks={i} />
          ))}
        </div>
      )}
    </section>
  );
}
