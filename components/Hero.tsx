import type { Produk } from '@/lib/types';
import { normalisasiFotoUrl } from '@/lib/api';

// Hero terbelah, bukan terpusat: teks di blok olive kiri, satu foto produk di
// kanan dalam bingkai label tenun. Blok olive ditutup pembatas bergelombang
// supaya perpindahan ke kertas terasa dijahit, bukan dipotong lurus.
export default function Hero({ sorot }: { sorot?: Produk }) {
  const foto = sorot ? normalisasiFotoUrl(sorot.foto, 1000) : '';

  return (
    <section>
      <div className="bg-olive">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-14 sm:px-8 md:grid-cols-[1.05fr_1fr] md:gap-14 md:pb-16 md:pt-20">
          <div className="naik">
            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.02em] text-olive-ink text-balance md:text-5xl lg:text-6xl">
              Rajutan Langensari, dibuat satu per satu.
            </h1>
            <p className="mt-5 max-w-sm font-body leading-relaxed text-olive-ink/85 text-pretty">
              Temukan produk buatan perajin Desa Langensari. Harga dan kontak pembuat
              tersedia pada setiap produk.
            </p>
            <a
              href="/katalog"
              className="mt-8 inline-block rounded-full bg-brick px-8 py-3.5 font-body text-[0.72rem] font-semibold uppercase tracking-label text-brick-ink transition-colors hover:bg-brick-strong active:translate-y-px"
            >
              Lihat semua produk
            </a>
          </div>

          <div className="naik [animation-delay:120ms]">
            {foto ? (
              <figure className="label-tenun">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto}
                  alt={sorot?.namaProduk ?? ''}
                  fetchPriority="high"
                  className="aspect-[4/5] w-full rounded-[14px] object-cover"
                />
              </figure>
            ) : (
              <div className="label-tenun flex aspect-[4/5] items-center justify-center p-8 text-center">
                <p className="font-display text-2xl font-bold leading-tight text-ink/60">
                  Produk pilihan akan tampil di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="gelombang" aria-hidden="true" />
    </section>
  );
}
