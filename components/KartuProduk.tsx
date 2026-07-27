import Link from 'next/link';
import type { Produk } from '@/lib/types';
import { formatRupiah, normalisasiFotoUrl, tautanWhatsapp } from '@/lib/api';

// Kartu polos: kotak bergaris tipis, foto, nama, pembuat, harga, satu tombol.
// Bingkai "label tenun" versi sebelumnya (stroke tebal plus garis rambut yang
// meleset) dibuang. Bingkai itu menambah tiga garis di sekeliling tiap foto dan
// di layar HP dua kolom hasilnya penuh sesak.
export default function KartuProduk({ produk, indeks = 0 }: { produk: Produk; indeks?: number }) {
  const foto = normalisasiFotoUrl(produk.foto, 840);
  const habis = produk.stok?.toLowerCase() === 'habis';

  return (
    <article
      className="naik angkat group flex flex-col overflow-hidden rounded-kartu border border-line bg-paper"
      // Kartu masuk bergiliran, bukan serentak. Jeda ditahan 45 ms dan
      // dibatasi 10 kartu: lebih lama dari itu, katalog terasa lambat
      // dibuka, bukan hidup.
      style={{ animationDelay: `${Math.min(indeks, 10) * 45}ms` }}
    >
      <Link href={`/produk/${produk.id}`} className="block overflow-hidden bg-surface">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={produk.namaProduk}
            loading="lazy"
            className="zoom-produk aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center">
            <span className="font-display text-3xl font-bold text-muted/50">
              {produk.namaProduk.charAt(0)}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/produk/${produk.id}`}>
          <h3 className="warna-interaktif font-display text-sm font-semibold leading-snug text-ink sm:text-base">
            {produk.namaProduk}
          </h3>
        </Link>
        <p className="mt-1 font-body text-xs text-muted">{produk.namaUmkm}</p>

        <p className="mt-3 font-display text-base font-bold text-ink sm:text-lg">
          {formatRupiah(produk.harga)}
        </p>

        <div className="mt-auto pt-4">
          {habis ? (
            <p className="rounded-full bg-surface py-2.5 text-center font-body text-xs text-muted">
              Stok habis
            </p>
          ) : (
            produk.kontakWa && (
              <a
                href={tautanWhatsapp(produk.kontakWa, produk.namaProduk)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Pesan ${produk.namaProduk} melalui WhatsApp`}
                className="tekan block rounded-full bg-olive py-2.5 text-center font-body text-xs font-semibold text-olive-ink transition-[transform,background-color] duration-150 ease-out hover:bg-olive-strong"
              >
                Pesan
              </a>
            )
          )}
        </div>
      </div>
    </article>
  );
}
