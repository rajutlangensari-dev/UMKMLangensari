'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Produk } from '@/lib/types';
import { useKurangiGerak } from '@/lib/gerak';
import KartuProduk from './KartuProduk';

/**
 * Rel produk yang bisa digeser.
 *
 * Memakai scroll native + scroll snap: jari, trackpad, keyboard, dan tombol
 * desktop semuanya menggerakkan permukaan yang sama. Tidak ada drag buatan yang
 * bertabrakan dengan gulir halaman di HP.
 *
 * JUDULNYA IKUT DI SINI, tidak lagi ditulis pemanggilnya. Alasannya bukan
 * kerapian: tombol geser harus sebaris dengan judulnya, dan yang tahu tombol itu
 * sedang bisa ditekan atau tidak hanyalah komponen ini. Selama judulnya di luar,
 * tombolnya terpaksa melayang di atas kartu terakhir — menutupi barang yang
 * justru sedang ditawarkan.
 */
export default function RelProduk({
  produk,
  label,
  judul,
  aksi,
}: {
  produk: Produk[];
  label: string;
  /** Judul bagian. Kalau kosong, hanya tombol geser yang dirender di barisnya. */
  judul?: string;
  /** Tautan pendamping di sebelah tombol, misalnya "Lihat semua produk". */
  aksi?: ReactNode;
}) {
  const relRef = useRef<HTMLDivElement>(null);
  const [bisaKiri, setBisaKiri] = useState(false);
  const [bisaKanan, setBisaKanan] = useState(false);
  const kurangiGerak = useKurangiGerak();

  const perbaruiKontrol = useCallback(() => {
    const rel = relRef.current;
    if (!rel) return;
    const sisaKanan = rel.scrollWidth - rel.clientWidth - rel.scrollLeft;
    setBisaKiri(rel.scrollLeft > 4);
    setBisaKanan(sisaKanan > 4);
  }, []);

  useEffect(() => {
    const rel = relRef.current;
    if (!rel) return;
    const ukur = () => perbaruiKontrol();
    rel.addEventListener('scroll', ukur, { passive: true });
    ukur();

    // ResizeObserver, bukan cuma listener resize window. Lebar rel juga berubah
    // saat sidebar/laci membuka, saat font diperbesar, dan saat orientasi HP
    // berputar — kejadian yang tidak semuanya memicu `resize` pada window.
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', ukur);
      return () => {
        rel.removeEventListener('scroll', ukur);
        window.removeEventListener('resize', ukur);
      };
    }
    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(rel);
    return () => {
      rel.removeEventListener('scroll', ukur);
      pengamat.disconnect();
    };
  }, [perbaruiKontrol, produk.length]);

  const gulir = (arah: -1 | 1) => {
    const rel = relRef.current;
    if (!rel) return;
    rel.scrollBy({
      left: arah * Math.max(rel.clientWidth * 0.78, 280),
      behavior: kurangiGerak ? 'auto' : 'smooth',
    });
  };

  if (produk.length === 0) return null;

  return (
    <div>
      {(judul || aksi) && (
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          {judul ? (
            <h2 className="font-display text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
              {judul}
            </h2>
          ) : (
            <span />
          )}
          {aksi}
        </div>
      )}

      <div className="rel-produk-bingkai">
        {/* DIMATIKAN, bukan dilepas dari DOM. Tombol yang muncul-hilang membuat
            barisan kartunya bergeser tepat saat kursor sudah bergerak ke sana,
            dan klik pertama mendarat di tempat yang salah. Lebarnya tetap; yang
            berubah hanya bisa-tidaknya ditekan. */}
        <div className="kontrol-rel" data-arah="kiri">
          <button
            type="button"
            onClick={() => gulir(-1)}
            disabled={!bisaKiri}
            className="tombol-rel tekan"
            aria-label={`Geser ${label} ke kiri`}
          >
            <Panah arah="kiri" />
          </button>
        </div>
        <div className="kontrol-rel" data-arah="kanan">
          <button
            type="button"
            onClick={() => gulir(1)}
            disabled={!bisaKanan}
            className="tombol-rel tekan"
            aria-label={`Geser ${label} ke kanan`}
          >
            <Panah arah="kanan" />
          </button>
        </div>

        <div
          ref={relRef}
          className="rel-produk"
          // `role="group"` + tabIndex membuat rel ini bisa digulir dengan panah
          // kiri/kanan papan ketik. Tanpa keduanya, `aria-label` pada div polos
          // diabaikan pembaca layar dan pengguna papan ketik hanya bisa bergerak
          // dengan melompati kartu satu per satu.
          role="group"
          aria-label={label}
          tabIndex={0}
          onFocusCapture={(event) => {
            const kartu = (event.target as HTMLElement).closest<HTMLElement>('[data-rel-kartu]');
            // `inline`/`block: 'nearest'` — bukan 'center'. 'center' ikut
            // menggeser HALAMAN saat fokus masuk ke kartu, jadi menekan Tab
            // membuat seluruh layar melompat.
            kartu?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }}
        >
          {produk.map((item, indeks) => (
            <div key={item.id} data-rel-kartu className="rel-produk-kartu">
              <KartuProduk produk={item} indeks={indeks} />
            </div>
          ))}
        </div>

        <span aria-hidden="true" className="isyarat-rel" data-tampil={bisaKanan} />
      </div>
    </div>
  );
}

function Panah({ arah }: { arah: 'kiri' | 'kanan' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d={arah === 'kiri' ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
