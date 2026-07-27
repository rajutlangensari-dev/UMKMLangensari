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
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold leading-tight text-ink">
        Produk tidak ditemukan
      </h1>
      <p className="mt-3 font-body text-sm leading-relaxed text-ink/70">
        Produk mungkin sudah dihapus atau tautannya tidak tepat.
      </p>
      <Link
        href="/katalog"
        className="mt-6 inline-block rounded-full bg-brick px-7 py-3 font-body text-[0.66rem] font-semibold uppercase tracking-label text-brick-ink transition-colors hover:bg-brick-strong"
      >
        Lihat katalog
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
        className="font-body text-[0.66rem] uppercase tracking-label text-ink/65 transition-colors hover:text-brick"
      >
        Kembali ke katalog
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div className="label-tenun">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt={produk.namaProduk}
              className="aspect-[4/5] w-full rounded-[14px] object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center">
              <span className="font-display text-6xl font-extrabold text-ink/25">
                {produk.namaProduk.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <span className="font-body text-[0.66rem] uppercase tracking-label text-ink/65">
            {produk.kategori}
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.06] tracking-[-0.02em] text-ink text-balance sm:text-4xl lg:text-5xl">
            {produk.namaProduk}
          </h1>
          <p className="mt-4 font-display text-2xl font-extrabold text-brick sm:text-3xl">
            {formatRupiah(produk.harga)}
          </p>

          {produk.deskripsi && (
            <p className="mt-6 max-w-[62ch] font-body leading-relaxed text-ink/75 text-pretty">
              {produk.deskripsi}
            </p>
          )}

          {/* Keterangan pembuat berdiri sendiri di blok oat: di katalog desa,
              siapa yang mengerjakan sama pentingnya dengan barangnya. */}
          <dl className="mt-8 rounded-[14px] bg-surface px-6 py-5">
            <dt className="font-body text-[0.62rem] uppercase tracking-label text-ink/65">
              Pembuat
            </dt>
            <dd className="mt-1.5 font-display text-lg font-extrabold text-ink">
              {produk.namaUmkm}
            </dd>
            {produk.alamat && (
              <dd className="mt-1 font-body text-sm text-ink/70">{produk.alamat}</dd>
            )}
          </dl>

          {habis ? (
            <p className="mt-8 font-body text-[0.66rem] uppercase tracking-label text-ink/65">
              Stok habis untuk saat ini
            </p>
          ) : (
            produk.kontakWa && (
              <a
                href={tautanWhatsapp(produk.kontakWa, produk.namaProduk)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block self-start rounded-full bg-brick px-8 py-4 font-body text-[0.7rem] font-semibold uppercase tracking-label text-brick-ink transition-colors hover:bg-brick-strong active:translate-y-px"
              >
                Pesan melalui WhatsApp
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}
