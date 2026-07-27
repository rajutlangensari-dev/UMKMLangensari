'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Pita from '@/components/Pita';
import RailKategori from '@/components/RailKategori';
import Cerita from '@/components/Cerita';
import Keunggulan from '@/components/Keunggulan';
import Footer from '@/components/Footer';
import { ambilProdukAktif } from '@/lib/api';
import type { Produk } from '@/lib/types';

export default function Beranda() {
  const [produk, setProduk] = useState<Produk[]>([]);

  // Katalog punya halamannya sendiri (/katalog); di beranda data produk dipakai
  // untuk foto hero, isi pita berjalan, dan menghitung kategori yang benar-benar ada.
  useEffect(() => {
    ambilProdukAktif()
      .then(setProduk)
      .catch(() => {});
  }, []);

  const berfoto = useMemo(() => produk.filter((p) => p.foto), [produk]);
  const sorot = berfoto[0];
  const fotoCerita = useMemo(
    () => berfoto.slice(1, 3).map((p) => p.foto),
    [berfoto]
  );

  return (
    <>
      <Header />
      <main>
        <Hero sorot={sorot} />
        <Pita produk={produk} />
        <RailKategori produk={produk} />
        <Cerita foto={fotoCerita} />
        <Keunggulan />
      </main>
      <Footer />
    </>
  );
}
