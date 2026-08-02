import Link from 'next/link';
import { normalisasiFotoUrl } from '@/lib/api';
import type { Umkm } from '@/lib/types';

/**
 * Kartu profil usaha. Pada perangkat berpenunjuk, foto meluas saat kartu dipilih
 * dan informasi berpindah ke atas foto. Pada layar sentuh, keadaan awal tetap
 * memuat seluruh informasi dan dapat dibuka dengan satu ketukan.
 */
export default function KartuUmkm({
  umkm,
  jumlahProduk,
  indeks,
}: {
  umkm: Umkm;
  jumlahProduk: number;
  indeks: number;
}) {
  const foto = normalisasiFotoUrl(umkm.foto, 720);
  const keterangan =
    umkm.bio.trim().split(/\n/)[0] || 'Lihat profil usaha, produk, dan cara menghubungi pemiliknya.';

  return (
    <Link
      href={`/umkm/${umkm.slug}`}
      className="kartu-profil-umkm naik tekan group relative isolate block h-[28rem] overflow-hidden rounded-kartu border border-line bg-surface"
      style={{ animationDelay: `${Math.min(indeks, 10) * 45}ms` }}
      aria-label={`Lihat profil ${umkm.nama}`}
    >
      <span className="kartu-profil-foto absolute inset-0 -z-20 block overflow-hidden bg-aksen/10">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="" loading={indeks < 3 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-start justify-center pt-20 font-display text-7xl font-bold text-aksen/45">
            {umkm.nama.charAt(0)}
          </span>
        )}
      </span>
      <span className="kartu-profil-scrim absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/5 opacity-0" />
      <span className="kartu-profil-dasar absolute inset-x-0 bottom-0 -z-10 h-[42%] bg-surface" />

      <span className="kartu-profil-isi absolute inset-x-0 bottom-0 flex min-h-[42%] flex-col justify-end p-5 sm:p-6">
        <span className="kartu-profil-judul block font-display text-xl font-bold tracking-[-0.02em] text-ink text-balance">
          {umkm.nama}
        </span>
        <span className="kartu-profil-bio mt-2 line-clamp-2 font-body text-sm leading-relaxed text-muted text-pretty">
          {keterangan}
        </span>
        <span className="mt-5 flex items-center justify-between gap-4">
          <span className="kartu-profil-meta font-body text-xs font-semibold text-muted">
            {jumlahProduk === 0 ? 'Belum ada produk' : `${jumlahProduk} produk`}
          </span>
          <span className="kartu-profil-aksi inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 font-body text-xs font-semibold text-ink">
            Lihat profil
            <span aria-hidden="true">&rarr;</span>
          </span>
        </span>
      </span>
    </Link>
  );
}
