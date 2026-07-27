import type { Produk } from '@/lib/types';
import { normalisasiFotoUrl } from '@/lib/api';

// Panel lembut dengan sudut membulat, teks di kiri, foto di kanan. Olive tidak
// lagi memenuhi seluruh blok; dia hanya muncul di tombol, satu-satunya hal yang
// perlu langsung terlihat bisa ditekan.
export default function Hero({ sorot }: { sorot?: Produk }) {
  const foto = sorot ? normalisasiFotoUrl(sorot.foto, 1000) : '';

  return (
    <section className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-12">
      <div className="naik grid items-center gap-8 rounded-[20px] bg-surface px-6 py-10 sm:px-10 sm:py-14 md:grid-cols-2 md:gap-12 md:px-14">
        <div>
          <h1 className="font-display text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-ink text-balance sm:text-4xl lg:text-5xl">
            Rajutan Langensari, langsung dari perajinnya
          </h1>
          <p className="mt-4 max-w-md font-body leading-relaxed text-muted text-pretty">
            Temukan produk rajut dari Kampung Cibayawak dan Cipaku. Lihat harganya,
            lalu pesan kepada perajinnya lewat WhatsApp.
          </p>
          <a
            href="/katalog"
            className="tekan mt-7 inline-block rounded-full bg-olive px-7 py-3 font-body text-sm font-semibold text-olive-ink transition-[transform,background-color] duration-150 ease-out hover:bg-olive-strong"
          >
            Lihat semua produk
          </a>
        </div>

        <div>
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt={sorot?.namaProduk ?? ''}
              fetchPriority="high"
              className="aspect-[4/3] w-full rounded-[14px] bg-paper object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-[14px] bg-paper px-6 text-center">
              <p className="font-body text-muted">Produk pilihan akan tampil di sini.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
