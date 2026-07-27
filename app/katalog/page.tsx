'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GridProduk from '@/components/GridProduk';
import { ambilProdukAktif } from '@/lib/api';
import type { Produk } from '@/lib/types';

export default function HalamanKatalog() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [status, setStatus] = useState<'memuat' | 'siap' | 'gagal'>('memuat');
  const [kategoriAwal, setKategoriAwal] = useState('Semua');
  const [pencarianAwal, setPencarianAwal] = useState('');

  useEffect(() => {
    // Query string dibaca langsung dari lokasi, bukan lewat useSearchParams, supaya
    // halaman ini tidak perlu dibungkus Suspense saat build.
    const param = new URLSearchParams(window.location.search);
    const dariUrl = param.get('kategori');
    if (dariUrl) setKategoriAwal(dariUrl);
    const cari = param.get('q');
    if (cari) setPencarianAwal(cari);

    ambilProdukAktif()
      .then((data) => {
        setProduk(data);
        setStatus('siap');
      })
      .catch(() => {
        setStatus('gagal');
      });
  }, []);

  return (
    <>
      <Header />
      <main className="pt-12 sm:pt-16">
        {status === 'memuat' && <RangkaMuat />}

        {status === 'gagal' && (
          <div className="mx-auto max-w-md px-5 py-24 text-center">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
              Katalog tidak dapat dimuat
            </h1>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink/70">
              Periksa koneksi internet, lalu coba lagi.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-brick px-7 py-3 font-body text-[0.66rem] font-semibold uppercase tracking-label text-brick-ink transition-colors hover:bg-brick-strong"
            >
              Coba lagi
            </button>
          </div>
        )}

        {status === 'siap' && (
          <GridProduk produk={produk} kategoriAwal={kategoriAwal} pencarianAwal={pencarianAwal} />
        )}
      </main>
      <Footer />
    </>
  );
}

// Rangka muat mengikuti bentuk kartu produk (foto 4:5 lalu tiga baris teks),
// jadi tata letak tidak melompat saat data datang.
function RangkaMuat() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat katalog</span>
      <div className="h-12 w-48 rounded-full bg-surface" />
      <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-3 lg:gap-x-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] w-full rounded-[14px] bg-surface" />
            <div className="mt-6 h-3 w-1/3 rounded-full bg-surface" />
            <div className="mt-3 h-4 w-3/4 rounded-full bg-surface" />
            <div className="mt-3 h-4 w-1/2 rounded-full bg-surface" />
          </div>
        ))}
      </div>
    </section>
  );
}
