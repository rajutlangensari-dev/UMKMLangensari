import Link from 'next/link';
import type { Produk } from '@/lib/types';
import RelProduk from './RelProduk';

// Beranda versi sebelumnya sama sekali tidak menampilkan produk; pengunjung
// harus menebak bahwa katalognya ada di menu. Untuk halaman muka sebuah katalog
// itu hal yang paling membingungkan. Barisan ini memperbaikinya.
export default function PratinjauProduk({ produk }: { produk: Produk[] }) {
  const tampil = produk.slice(0, 8);
  if (tampil.length === 0) return null;

  return (
    <section className="sembul mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Judul dan tombol geser dirender RelProduk, bukan di sini. Tombolnya
          harus sebaris dengan judulnya, dan yang tahu ia sedang bisa ditekan
          atau tidak hanyalah komponen itu.
          Bukan "Produk terbaru": data tidak diurutkan menurut tanggal, jadi
          klaim itu tidak bisa dipertanggungjawabkan. Yang benar adalah ini
          produk yang statusnya sedang aktif. */}
      <RelProduk
        produk={tampil}
        label="Produk dari warga Langensari"
        judul="Produk dari warga Langensari"
        aksi={
          <Link
            href="/katalog"
            className="shrink-0 font-body text-sm text-aksen transition-colors hover:text-aksen-kuat"
          >
            Lihat semua produk
          </Link>
        }
      />
    </section>
  );
}
