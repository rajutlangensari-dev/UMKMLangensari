import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ambilProdukAktif, formatRupiah, normalisasiFotoUrl, tautanWhatsapp } from '@/lib/api';
import type { Produk } from '@/lib/types';

// Halaman ini dirender di server, bukan di browser, supaya WhatsApp dan media
// sosial bisa membaca judul, harga, dan foto produknya saat tautan dibagikan.
// Versi klien sebelumnya membuat semua produk memakai pratinjau yang sama.
// Membagikan satu produk ke calon pembeli adalah pemakaian utama katalog ini,
// jadi pratinjau per produk lebih penting daripada render di browser.

// `cache` menyatukan pemanggilan yang sama dalam satu render, jadi generateMetadata
// dan komponen halaman berbagi satu permintaan ke Apps Script, bukan dua.
const ambilProduk = cache(async (id: string): Promise<Produk | null> => {
  try {
    const semua = await ambilProdukAktif();
    return semua.find((p) => p.id === id) ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const produk = await ambilProduk(params.id);
  if (!produk) return { title: 'Produk tidak ditemukan' };

  const judul = `${produk.namaProduk} | Rajut Langensari`;
  const deskripsi =
    produk.deskripsi?.trim() ||
    `${produk.namaProduk} buatan ${produk.namaUmkm}, ${formatRupiah(produk.harga)}.`;
  const foto = normalisasiFotoUrl(produk.foto, 1200);

  return {
    // Judul tab memakai template dari layout ("%s | Rajut Langensari"), jadi di
    // sini cukup nama produknya saja supaya nama merek tidak muncul dua kali.
    title: produk.namaProduk,
    description: deskripsi,
    openGraph: {
      title: judul,
      description: deskripsi,
      type: 'website',
      images: foto ? [{ url: foto, width: 1200, alt: produk.namaProduk }] : undefined,
    },
  };
}

export default async function HalamanDetailProduk({ params }: { params: { id: string } }) {
  const produk = await ambilProduk(params.id);

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{produk ? <Isi produk={produk} /> : <TidakAda />}</main>
      <Footer />
    </>
  );
}

function TidakAda() {
  return (
    <div className="mx-auto max-w-sm px-5 py-24 text-center">
      <h1 className="font-display text-xl font-bold leading-snug text-ink">
        Produk ini sudah tidak ada
      </h1>
      <p className="mt-2 font-body text-sm leading-relaxed text-muted">
        Mungkin sudah ditarik dari katalog, atau tautannya salah ketik.
      </p>
      <Link
        href="/katalog"
        className="tekan mt-6 inline-block rounded-full bg-olive px-6 py-2.5 font-body text-sm font-semibold text-olive-ink transition-[transform,background-color] duration-150 ease-out hover:bg-olive-strong"
      >
        Lihat produk lain
      </Link>
    </div>
  );
}

function Isi({ produk }: { produk: Produk }) {
  const foto = normalisasiFotoUrl(produk.foto, 1000);
  const habis = produk.stok?.toLowerCase() === 'habis';

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/katalog"
        className="font-body text-sm text-muted transition-colors hover:text-ink"
      >
        Kembali ke katalog
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        <div className="overflow-hidden rounded-kartu border border-line bg-surface">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt={produk.namaProduk}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center">
              <span className="font-display text-5xl font-bold text-muted/50">
                {produk.namaProduk.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <span className="font-body text-sm text-muted">{produk.kategori}</span>
          <h1 className="mt-2 font-display text-2xl font-bold leading-snug tracking-[-0.02em] text-ink text-balance sm:text-3xl">
            {produk.namaProduk}
          </h1>
          <p className="mt-3 font-display text-2xl font-bold text-ink">
            {formatRupiah(produk.harga)}
          </p>

          {produk.deskripsi && (
            <p className="mt-5 max-w-prose font-body leading-relaxed text-muted text-pretty">
              {produk.deskripsi}
            </p>
          )}

          {/* Siapa yang mengerjakan berdiri sendiri: di katalog desa, itu bagian
              dari alasan orang membeli, bukan keterangan tambahan. */}
          <dl className="mt-7 rounded-kartu border border-line px-5 py-4">
            <dt className="font-body text-sm text-muted">Dibuat oleh</dt>
            <dd className="mt-1 font-display font-semibold text-ink">{produk.namaUmkm}</dd>
            {produk.alamat && (
              <dd className="mt-0.5 font-body text-sm text-muted">{produk.alamat}</dd>
            )}
          </dl>

          {habis ? (
            <p className="mt-7 rounded-full bg-surface px-5 py-3 text-center font-body text-sm text-muted">
              Stok sedang habis. Tanyakan ke perajin kapan bisa dibuatkan lagi.
            </p>
          ) : (
            produk.kontakWa && (
              <a
                href={tautanWhatsapp(produk.kontakWa, produk.namaProduk)}
                target="_blank"
                rel="noopener noreferrer"
                className="tekan mt-7 inline-block self-start rounded-full bg-olive px-7 py-3 font-body text-sm font-semibold text-olive-ink transition-[transform,background-color] duration-150 ease-out hover:bg-olive-strong"
              >
                Pesan lewat WhatsApp
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}
