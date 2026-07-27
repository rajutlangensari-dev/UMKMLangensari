'use client';

import { useEffect, useMemo, useState } from 'react';
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

  // Kategori dan kata pencarian ditulis balik ke alamat, jadi hasil saringan
  // bisa disalin dan dikirim lewat WhatsApp apa adanya. Dipakai replaceState,
  // bukan pushState, supaya tombol kembali tidak terisi satu entri per huruf
  // yang diketik.
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
    <section id="katalog" className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-24 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/12 pb-6">
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.025em] text-ink sm:text-5xl lg:text-6xl">
          Katalog produk
        </h1>
        <p
          className="font-body text-[0.68rem] uppercase tracking-label text-ink/70"
          aria-live="polite"
        >
          {hasilFilter.length} produk ditemukan
        </p>
      </div>

      <div className="sticky top-[6.5rem] z-20 -mx-5 mb-12 bg-paper/92 px-5 py-4 backdrop-blur-sm sm:-mx-8 sm:px-8">
        {/* Pil kategori bisa digulir mendatar di HP, jadi tidak melipat sampai
            tiga baris dan mendorong produk turun jauh. */}
        <div className="flex snap-x gap-2 overflow-x-auto pb-1">
          {daftarKategori.map((kategori) => (
            <button
              type="button"
              key={kategori}
              onClick={() => setKategoriAktif(kategori)}
              aria-pressed={kategoriAktif === kategori}
              className={`shrink-0 snap-start whitespace-nowrap rounded-full px-5 py-2.5 font-body text-[0.66rem] uppercase tracking-label transition-colors ${
                kategoriAktif === kategori
                  ? 'bg-olive text-olive-ink'
                  : 'border border-ink/20 text-ink/65 hover:border-brick hover:text-brick'
              }`}
            >
              {kategori}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block font-body text-xs font-semibold text-ink/70">
            Cari di katalog
          </span>
          <input
            type="search"
            placeholder="Nama produk atau pembuat"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            className="w-full rounded-full border border-ink/20 bg-surface px-5 py-3 font-body text-sm text-ink placeholder:text-ink/70 focus:border-brick focus:outline-none sm:max-w-md"
          />
        </label>
      </div>

      {hasilFilter.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <p className="font-display text-2xl font-extrabold leading-tight text-ink">
            Produk tidak ditemukan
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-ink/70">
            Gunakan kata pencarian lain atau pilih kategori Semua.
          </p>
          <button
            type="button"
            onClick={() => {
              setPencarian('');
              setKategoriAktif('Semua');
            }}
            className="mt-6 rounded-full bg-brick px-7 py-3 font-body text-[0.66rem] font-semibold uppercase tracking-label text-brick-ink transition-colors hover:bg-brick-strong"
          >
            Hapus filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-20">
          {hasilFilter.map((p) => (
            <KartuProduk key={p.id} produk={p} />
          ))}
        </div>
      )}
    </section>
  );
}
