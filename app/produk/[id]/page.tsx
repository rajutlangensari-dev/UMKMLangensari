import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import HeaderUmkm from '@/components/HeaderUmkm';
import RelProduk from '@/components/RelProduk';
import Footer from '@/components/Footer';
import { formatRupiah, normalisasiFotoUrl, tautanWhatsapp } from '@/lib/api';
import { produkPublik, umkmPublik } from '@/lib/publik';
import type { Produk } from '@/lib/types';

/**
 * Dirender ULANG TIAP PERMINTAAN, tapi datanya diambil dari cache 60 detik
 * (lihat lib/publik.ts). Dua hal yang berbeda, dan bedanya menentukan.
 *
 * Sempat dicoba kebalikannya: halaman ikut di-cache sebagai HTML (ISR 60
 * detik). Itu memang paling cepat — berkas siap saji, tanpa render sama
 * sekali. Tapi ia diprarender SAAT BUILD, dan build yang kebetulan berjalan
 * saat Apps Script sedang lambat menghasilkan halaman KOSONG yang lalu
 * disajikan apa adanya. Diuji langsung dan memang terjadi: beranda hasil build
 * berisi nol produk.
 *
 * Untuk katalog desa yang di-deploy sesekali dan backend-nya sekali waktu
 * menggantung berdetik-detik, mempertaruhkan seluruh isi situs pada keadaan
 * backend di satu menit saat build adalah harga yang jauh lebih mahal daripada
 * biaya merender ulang — yang toh cuma puluhan milidetik karena datanya sudah
 * ada di memori.
 */
export const dynamic = 'force-dynamic';

// Halaman ini dirender di server, bukan di browser, supaya WhatsApp dan media
// sosial bisa membaca judul, harga, dan foto produknya saat tautan dibagikan.
// Versi klien sebelumnya membuat semua produk memakai pratinjau yang sama.
// Membagikan satu produk ke calon pembeli adalah pemakaian utama katalog ini,
// jadi pratinjau per produk lebih penting daripada render di browser.

// `cache` menyatukan pemanggilan yang sama dalam satu render, jadi generateMetadata
// dan komponen halaman berbagi satu permintaan ke Apps Script, bukan dua.
const ambilSemuaProduk = cache(async (): Promise<Produk[]> => {
  try {
    return await produkPublik();
  } catch {
    return [];
  }
});

const ambilProduk = cache(async (id: string): Promise<Produk | null> => {
  const semua = await ambilSemuaProduk();
  return semua.find((p) => p.id === id) ?? null;
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const produk = await ambilProduk(params.id);
  if (!produk) return { title: 'Produk tidak ditemukan' };

  const judul = `${produk.namaProduk} | UMKM Langensari`;
  const deskripsi =
    produk.deskripsi?.trim() ||
    `${produk.namaProduk} buatan ${produk.namaUmkm}, ${formatRupiah(produk.harga)}.`;
  const foto = normalisasiFotoUrl(produk.foto, 1200);

  return {
    // Judul tab memakai template dari layout ("%s | UMKM Langensari"), jadi di
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
  const [produk, semuaProduk] = await Promise.all([ambilProduk(params.id), ambilSemuaProduk()]);

  // Slug pembuatnya dicari di sini, bukan di kartu katalog: halaman ini sudah
  // dirender di server, jadi tidak ada permintaan tambahan dari browser. Kalau
  // gagal atau produknya belum punya umkmId, nama pembuat tampil sebagai teks
  // biasa — halaman tetap utuh.
  let pemilik: Awaited<ReturnType<typeof umkmPublik>>[number] | undefined;
  if (produk?.umkmId) {
    try {
      const daftar = await umkmPublik();
      const milik = daftar.find((u) => u.id === produk.umkmId);
      if (milik && milik.status === 'aktif') pemilik = milik;
    } catch {
      pemilik = undefined;
    }
  }

  // Halaman produk memakai identitas usahanya — header dan tema yang sama
  // dengan halaman usahanya. Pengunjung yang datang lewat tautan produk
  // langsung dari WhatsApp jadi tahu ia sedang berada di toko siapa, bukan cuma
  // di suatu tempat di dalam portal.
  //
  // Produk tanpa pemilik (data lama) jatuh ke header portal. Halamannya tetap
  // utuh, cuma tanpa identitas usaha yang memang belum ada. Jalan masuk ke
  // seluruh isi tokonya adalah nama usaha di header, yang menuju halaman
  // profilnya.
  return (
    <div data-tema={pemilik?.tema}>
      {pemilik ? (
        <HeaderUmkm nama={pemilik.nama} foto={pemilik.foto} slug={pemilik.slug} />
      ) : (
        <Header />
      )}
      <main className="min-h-[60vh]">
        {produk ? (
          <Isi
            produk={produk}
            slugUmkm={pemilik?.slug ?? ''}
            rekomendasi={susunRekomendasi(produk, semuaProduk)}
          />
        ) : (
          <TidakAda />
        )}
      </main>
      <Footer />
    </div>
  );
}

function TidakAda() {
  return (
    <div className="mx-auto max-w-sm px-5 py-24 text-center">
      <h1 className="font-display text-xl font-bold leading-snug text-ink">
        Produk tidak ditemukan
      </h1>
      <p className="mt-2 font-body text-sm leading-relaxed text-muted">
        Produk mungkin sudah tidak tersedia atau tautannya kurang tepat.
      </p>
      <Link
        href="/katalog"
        className="tekan mt-6 inline-block rounded-full bg-aksen px-6 py-2.5 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
      >
        Cari produk lain
      </Link>
    </div>
  );
}

function Isi({
  produk,
  slugUmkm,
  rekomendasi,
}: {
  produk: Produk;
  slugUmkm: string;
  rekomendasi: Produk[];
}) {
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
            <dt className="font-body text-sm text-muted">Dari usaha</dt>
            <dd className="mt-1 font-display font-semibold text-ink">{produk.namaUmkm}</dd>
            {produk.alamat && (
              <dd className="mt-0.5 font-body text-sm text-muted">{produk.alamat}</dd>
            )}
            {slugUmkm && (
              <dd className="mt-3">
                <Link
                  href={`/umkm/${slugUmkm}`}
                  className="warna-interaktif font-body text-sm text-muted underline underline-offset-4"
                >
                  Kunjungi halaman usahanya
                </Link>
              </dd>
            )}
          </dl>

          {habis ? (
            <p className="mt-7 rounded-full bg-surface px-5 py-3 text-center font-body text-sm text-muted">
              Stok sedang habis. Hubungi usahanya untuk menanyakan kapan produk tersedia lagi.
            </p>
          ) : (
            produk.kontakWa && (
              <a
                href={tautanWhatsapp(produk.kontakWa, produk.namaProduk)}
                target="_blank"
                rel="noopener noreferrer"
                className="tekan mt-7 inline-block self-start rounded-full bg-aksen px-7 py-3 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
              >
                Tanya stok lewat WhatsApp
              </a>
            )
          )}
        </div>
      </div>

      {rekomendasi.length > 0 && (
        <section className="sembul mt-16 border-t border-line pt-10 sm:mt-20 sm:pt-14">
          {/* Judulnya dua baris (kalimat pengantar di atas judul), jadi ia tetap
              ditulis di sini — `judul` milik RelProduk cuma menerima satu teks.
              Tombol geser dan tautan katalognya diserahkan ke RelProduk supaya
              keduanya sebaris dan tombolnya tahu kapan harus dimatikan. */}
          <p className="font-body text-sm font-semibold text-aksen">Pilihan lain</p>
          <h2 className="mb-6 mt-1 font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">
            Lihat produk lainnya
          </h2>
          <RelProduk
            produk={rekomendasi}
            label="Produk lain untuk dilihat"
            aksi={
              <Link
                href="/katalog"
                className="warna-interaktif shrink-0 font-body text-sm text-muted underline underline-offset-4"
              >
                Lihat semua produk
              </Link>
            }
          />
        </section>
      )}
    </div>
  );
}

// Tidak ada klaim "serupa untukmu" yang seolah-olah personal. Urutannya jelas
// dan dapat dipertanggungjawabkan: toko yang sama, lalu kategori yang sama,
// lalu produk aktif lain. Set menjaga satu barang tidak masuk dua kali.
function susunRekomendasi(saatIni: Produk, semua: Produk[]): Produk[] {
  const kandidat = semua.filter((item) => item.id !== saatIni.id);
  const hasil: Produk[] = [];
  const sudahAda = new Set<string>();
  const tambah = (daftar: Produk[]) => {
    for (const item of daftar) {
      if (!sudahAda.has(item.id)) {
        sudahAda.add(item.id);
        hasil.push(item);
      }
      if (hasil.length === 8) return;
    }
  };

  if (saatIni.umkmId) tambah(kandidat.filter((item) => item.umkmId === saatIni.umkmId));
  if (hasil.length < 8 && saatIni.kategori) {
    tambah(kandidat.filter((item) => item.kategori === saatIni.kategori));
  }
  if (hasil.length < 8) tambah(kandidat);

  return hasil;
}
