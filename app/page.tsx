'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Fakta from '@/components/Fakta';
import RailKategori from '@/components/RailKategori';
import PratinjauProduk from '@/components/PratinjauProduk';
import Cerita from '@/components/Cerita';
import Footer from '@/components/Footer';
import { ambilProdukAktif } from '@/lib/api';
import type { Produk } from '@/lib/types';

export default function Beranda() {
  const [produk, setProduk] = useState<Produk[]>([]);

  useEffect(() => {
    ambilProdukAktif()
      .then(setProduk)
      .catch(() => {});
  }, []);

  const berfoto = useMemo(() => produk.filter((p) => p.foto), [produk]);
  const sorot = berfoto[0];
  const fotoCerita = useMemo(() => berfoto.slice(1, 2).map((p) => p.foto), [berfoto]);

  return (
    <>
      <Header />
      <main>
        <Hero sorot={sorot} />
        <Fakta />
        <RailKategori produk={produk} />
        <PratinjauProduk produk={produk} />
        <Cerita foto={fotoCerita} />
      </main>
      <Footer />
    </>
  );
}
