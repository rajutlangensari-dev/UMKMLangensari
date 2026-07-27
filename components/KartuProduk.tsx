import Link from 'next/link';
import type { Produk } from '@/lib/types';
import { formatRupiah, normalisasiFotoUrl, tautanWhatsapp } from '@/lib/api';

export default function KartuProduk({ produk }: { produk: Produk }) {
  // Kartu tampil paling lebar ~420 px (satu kolom di HP), dikali dua untuk retina.
  const foto = normalisasiFotoUrl(produk.foto, 840);
  const habis = produk.stok?.toLowerCase() === 'habis';

  return (
    <article className="group flex flex-col">
      {/* Bingkai label tenun dipasang di pembungkus luar; klip pembesaran foto
          dilakukan lapisan dalam supaya garis rambut brick tidak ikut terpotong. */}
      <Link href={`/produk/${produk.id}`} className="label-tenun block">
        <div className="overflow-hidden rounded-[14px]">
          {foto ? (
            // Foto dari Cloudinary atau link tempel manual; pakai <img> biasa agar
            // tidak bergantung pada daftar host pengoptimal gambar Next.js.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt={produk.namaProduk}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center">
              <span className="font-display text-4xl font-extrabold text-ink/25">
                {produk.namaProduk.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-6">
        <span className="font-body text-[0.62rem] uppercase tracking-label text-ink/65">
          {produk.kategori}
        </span>
        <Link href={`/produk/${produk.id}`} className="mt-2">
          <h3 className="font-display text-lg font-extrabold leading-tight tracking-[-0.01em] text-ink transition-colors group-hover:text-brick sm:text-xl">
            {produk.namaProduk}
          </h3>
        </Link>
        <p className="mt-1.5 font-body text-sm text-ink/70">
          {produk.namaUmkm}, {produk.alamat}
        </p>

        <p className="mt-3 font-display text-xl font-extrabold text-brick sm:text-2xl">
          {formatRupiah(produk.harga)}
        </p>

        {habis ? (
          <p className="mt-4 font-body text-[0.66rem] uppercase tracking-label text-ink/65">
            Stok habis
          </p>
        ) : (
          produk.kontakWa && (
            <a
              href={tautanWhatsapp(produk.kontakWa, produk.namaProduk)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Pesan ${produk.namaProduk} melalui WhatsApp`}
              className="mt-4 whitespace-nowrap rounded-full border border-ink/25 px-5 py-2.5 text-center font-body text-[0.66rem] font-semibold uppercase tracking-label text-ink transition-colors hover:border-brick hover:bg-brick hover:text-brick-ink active:translate-y-px"
            >
              Pesan
            </a>
          )
        )}
      </div>
    </article>
  );
}
