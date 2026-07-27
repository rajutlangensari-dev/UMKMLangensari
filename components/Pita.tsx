import Link from 'next/link';
import type { Produk } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

// Pita berjalan yang membawa isi nyata: produk yang sedang ada, masing-masing
// tertaut ke halamannya. Bukan strip dekorasi. Berhenti saat disorot atau
// difokus keyboard supaya tautannya bisa diklik.
export default function Pita({ produk }: { produk: Produk[] }) {
  // Di bawah empat produk, pita jalan terlihat seperti bug (celah besar lalu
  // mengulang). Lebih baik tidak dirender sama sekali.
  if (produk.length < 4) return null;

  const isi = (
    <>
      {produk.map((p) => (
        <Link
          key={p.id}
          href={`/produk/${p.id}`}
          className="mx-7 inline-flex items-baseline gap-2.5 py-3 font-body text-[0.72rem] uppercase tracking-label text-olive-ink/85 transition-colors hover:text-olive-ink"
        >
          <span>{p.namaProduk}</span>
          <span className="text-olive-ink/70">{formatRupiah(p.harga)}</span>
        </Link>
      ))}
    </>
  );

  return (
    <section className="pita overflow-hidden bg-olive" aria-label="Produk yang sedang tersedia">
      <div className="pita-jalan">
        {isi}
        {/* Salinan kedua hanya untuk menutup jahitan animasi, disembunyikan dari
            pembaca layar supaya daftar produk tidak terbaca dua kali. */}
        <span aria-hidden="true" className="contents">
          {isi}
        </span>
      </div>
    </section>
  );
}
