import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import HeaderUmkm from '@/components/HeaderUmkm';
import Footer from '@/components/Footer';
import GridProduk from '@/components/GridProduk';
import { normalisasiFotoUrl, tautanWhatsapp } from '@/lib/api';
import { ambilUmkm, produkUmkm } from '../data';

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

/**
 * Katalog lengkap satu usaha.
 *
 * KENAPA HALAMAN TERSENDIRI, bukan satu bagian lagi di halaman utamanya:
 *
 * Halaman utama usaha adalah profil — ia harus meyakinkan orang bahwa usaha ini
 * sungguhan, dikerjakan orang sungguhan, di tempat yang bisa didatangi. Yang
 * menjawab itu cerita, keunggulan, galeri, dan kontaknya. Daftar barang yang
 * panjang di tengah-tengah semua itu justru mengubur keduanya: profilnya
 * terpotong, dan barangnya sulit dicari karena tidak ada kolom pencarian di
 * tengah halaman profil.
 *
 * Halaman ini kebalikannya: tidak ada cerita, tidak ada hiasan, semua barangnya
 * sekaligus dengan pencarian dan saringan kategori. Orang yang datang ke sini
 * sudah tahu mau apa.
 *
 * Alamatnya juga jadi tautan yang berguna sendiri. `/umkm/rajut/katalog` bisa
 * dikirim ke calon pembeli lewat WhatsApp tanpa dia harus menggulir melewati
 * profil dulu — dan dengan saringan, `?kategori=Tas` pun ikut terbawa.
 *
 * Kisinya memakai `GridProduk`, komponen yang sama dengan katalog seluruh
 * portal. Menyalinnya jadi versi khusus toko berarti dua kisi yang perlahan
 * berbeda perilaku, dan yang satu akan ketinggalan setiap kali yang lain
 * diperbaiki.
 */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const umkm = await ambilUmkm(params.slug);
  if (!umkm || umkm.status === 'nonaktif') return { title: 'UMKM tidak ditemukan' };

  const judul = `Katalog ${umkm.nama}`;
  const deskripsi = `Lihat produk dari ${umkm.nama} beserta harganya, kemudian hubungi pemilik usaha melalui WhatsApp.`;
  const foto = normalisasiFotoUrl(umkm.foto, 1200);

  return {
    title: judul,
    description: deskripsi,
    openGraph: {
      title: `${judul} | UMKM Langensari`,
      description: deskripsi,
      type: 'website',
      images: foto ? [{ url: foto, width: 1200, alt: umkm.nama }] : undefined,
    },
  };
}

export default async function KatalogUmkm({ params, searchParams }: {
  params: { slug: string };
  searchParams: { kategori?: string; q?: string };
}) {
  const umkm = await ambilUmkm(params.slug);

  // Sama dengan halaman utamanya: slug tak dikenal dan usaha nonaktif
  // diperlakukan sama, karena dari luar keduanya memang tidak ada.
  if (!umkm || umkm.status === 'nonaktif') notFound();

  const { produk, gagal } = await produkUmkm(umkm.id);

  return (
    <div data-tema={umkm.tema}>
      <HeaderUmkm nama={umkm.nama} foto={umkm.foto} slug={umkm.slug} />
      <main className="min-h-[60vh] pt-10 sm:pt-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Link
            href={`/umkm/${umkm.slug}`}
            className="font-body text-sm text-muted transition-colors hover:text-ink"
          >
            &larr; Kembali ke {umkm.nama}
          </Link>
        </div>

        {gagal ? (
          <div className="mx-auto max-w-sm px-5 py-24 text-center">
            <h1 className="font-display text-xl font-bold leading-snug text-ink">
              Katalog belum dapat dimuat
            </h1>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted">
              Periksa koneksi internet, kemudian muat ulang halaman ini.
            </p>
          </div>
        ) : produk.length === 0 ? (
          // Kosong dan gagal dibedakan. `GridProduk` punya keadaan kosongnya
          // sendiri, tapi bunyinya "Tidak ada yang cocok, coba kata lain" —
          // salah untuk usaha yang memang belum memasang produk apa pun, karena
          // tidak ada kata lain yang akan menolong.
          <div className="mx-auto max-w-md px-5 py-24 text-center sm:px-8">
            <h1 className="font-display text-xl font-bold leading-snug text-ink">
              Katalog {umkm.nama}
            </h1>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted text-pretty">
              Produk belum ditampilkan dalam katalog ini. Hubungi pemilik usaha untuk menanyakan pilihan yang tersedia.
            </p>
            {umkm.kontakWa && (
              <a
                href={tautanWhatsapp(umkm.kontakWa, `produk ${umkm.nama}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="tekan mt-6 inline-block rounded-full bg-aksen px-6 py-2.5 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
              >
                Tanyakan produk melalui WhatsApp
              </a>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <GridProduk
              produk={produk}
              kategoriAwal={searchParams.kategori || 'Semua'}
              pencarianAwal={searchParams.q || ''}
              judul={`Katalog ${umkm.nama}`}
              // "atau perajin" dibuang: di sini perajinnya cuma satu, jadi
              // menawarkan pencarian nama perajin menyuruh orang mengetik
              // sesuatu yang tidak menyaring apa pun.
              petunjukCari={`Cari produk di ${umkm.nama}`}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
