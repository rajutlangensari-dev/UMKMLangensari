'use client';

import { useState } from 'react';
import KartuProduk from '@/components/KartuProduk';
import type { Produk } from '@/lib/types';

/**
 * Kisi produk beserta rail kategorinya.
 *
 * Komponen klien karena penyaringannya berlangsung tanpa memuat ulang halaman.
 * Yang disaring adalah daftar yang SUDAH ada di halaman ini — tidak ada
 * permintaan baru ke server saat kategori diganti.
 *
 * Rail hanya muncul kalau ada lebih dari satu kategori. Rail berisi satu tombol
 * bukan pilihan; ia hiasan yang memakan tempat dan menyuruh orang menimbang
 * sesuatu yang tidak bisa ditimbang.
 */
export default function KatalogIsi({
  produk,
  kategori,
  kategoriAwal,
}: {
  produk: Produk[];
  kategori: string[];
  kategoriAwal: string;
}) {
  const [aktif, setAktif] = useState(kategori.includes(kategoriAwal) ? kategoriAwal : '');
  const tampil = aktif ? produk.filter((p) => p.kategori === aktif) : produk;

  return (
    <>
      {kategori.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Saring menurut kategori">
          <Pil aktif={!aktif} onClick={() => setAktif('')}>
            Semua
          </Pil>
          {kategori.map((k) => (
            <Pil key={k} aktif={aktif === k} onClick={() => setAktif(k)}>
              {k}
            </Pil>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {tampil.map((p, i) => (
          <KartuProduk key={p.id} produk={p} indeks={i} />
        ))}
      </div>
    </>
  );
}

function Pil({
  aktif,
  onClick,
  children,
}: {
  aktif: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className={`tekan min-h-11 rounded-full px-5 font-body text-sm transition-[transform,color,background-color,border-color] duration-150 ease-out ${
        aktif
          ? 'bg-aksen text-aksen-ink'
          : 'border border-line text-muted hover:border-aksen hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
