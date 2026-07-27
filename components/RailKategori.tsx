import Link from 'next/link';
import type { Produk } from '@/lib/types';
import { normalisasiFotoUrl } from '@/lib/api';

// Judul di kiri, tautan lihat semua di kanan, lingkaran foto di bawahnya.
// Foto produk asli, bukan ikon gambar tangan.
export default function RailKategori({ produk }: { produk: Produk[] }) {
  const kategori = ringkasKategori(produk);
  if (kategori.length < 2) return null;

  return (
    <section className="sembul mx-auto max-w-6xl px-5 py-4 sm:px-8 sm:py-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
          Pilih jenis produk
        </h2>
        <Link
          href="/katalog"
          className="shrink-0 font-body text-sm text-olive transition-colors hover:text-olive-strong"
        >
          Lihat katalog
        </Link>
      </div>

      <ul className="mt-7 flex snap-x gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible lg:grid-cols-6">
        {kategori.map((k) => (
          <li key={k.nama} className="w-24 shrink-0 snap-start sm:w-auto">
            <Link
              href={`/katalog?kategori=${encodeURIComponent(k.nama)}`}
              className="tekan group block"
            >
              <div className="overflow-hidden rounded-full bg-surface">
                {k.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={k.foto}
                    alt=""
                    loading="lazy"
                    className="zoom-kategori aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center">
                    <span className="font-display text-2xl font-bold text-muted/50">
                      {k.nama.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className="warna-interaktif mt-3 text-center font-body text-xs text-ink">
                {k.nama}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ringkasKategori(produk: Produk[]) {
  const peta = new Map<string, { nama: string; jumlah: number; foto: string }>();
  for (const p of produk) {
    if (!p.kategori) continue;
    const ada = peta.get(p.kategori);
    if (ada) {
      ada.jumlah += 1;
      if (!ada.foto && p.foto) ada.foto = normalisasiFotoUrl(p.foto, 300);
    } else {
      peta.set(p.kategori, {
        nama: p.kategori,
        jumlah: 1,
        foto: p.foto ? normalisasiFotoUrl(p.foto, 300) : '',
      });
    }
  }
  return Array.from(peta.values()).sort((a, b) => b.jumlah - a.jumlah);
}
