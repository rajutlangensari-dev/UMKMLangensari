import Link from 'next/link';
import type { Produk } from '@/lib/types';
import KartuProduk from './KartuProduk';

// Beranda versi sebelumnya sama sekali tidak menampilkan produk; pengunjung
// harus menebak bahwa katalognya ada di menu. Untuk halaman muka sebuah katalog
// itu hal yang paling membingungkan. Barisan ini memperbaikinya.
export default function PratinjauProduk({ produk }: { produk: Produk[] }) {
  const tampil = produk.slice(0, 8);
  if (tampil.length === 0) return null;

  return (
    <section className="sembul mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex items-baseline justify-between gap-4">
        {/* Bukan "Produk terbaru": data tidak diurutkan menurut tanggal, jadi
            klaim itu tidak bisa dipertanggungjawabkan. Yang benar adalah ini
            produk yang statusnya sedang aktif. */}
        <h2 className="font-display text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
          Produk yang tersedia
        </h2>
        <Link
          href="/katalog"
          className="shrink-0 font-body text-sm text-olive transition-colors hover:text-olive-strong"
        >
          Lihat semua produk
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {tampil.map((p, i) => (
          <KartuProduk key={p.id} produk={p} indeks={i} />
        ))}
      </div>
    </section>
  );
}
