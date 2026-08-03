import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HeaderUmkm from '@/components/HeaderUmkm';
import BingkaiTemaUmkm from '@/components/BingkaiTemaUmkm';
import Footer from '@/components/Footer';
import RenderBlok from '@/components/blok/Blok';
import { normalisasiFotoUrl } from '@/lib/api';
import { halamanAtauBawaan, jangkarHalaman } from '@/lib/blok';
import { ambilUmkm, produkUmkm, sumber } from './data';

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

// SATU berkas ini melayani SEMUA UMKM, berapa pun jumlahnya. Mendaftarkan UMKM
// baru tidak membuat berkas baru dan tidak butuh deploy ulang — slug-nya dibaca
// dari alamat lalu dicari barisnya di sheet. Jangan pernah menambahkan cabang
// khusus per UMKM di sini; itu justru yang dihindari rancangan ini.
//
// Bentuk halamannya pun tidak lagi dipatok di berkas ini. Ia disusun dari blok
// yang tersimpan di baris UMKM-nya, jadi dua usaha bisa punya halaman yang
// benar-benar berbeda tanpa satu baris kode pun ditambahkan.
//
// INI HALAMAN PROFIL, bukan daftar barang. Blok katalog di sini hanya menyorot
// sebagian produk lalu menautkan ke `/umkm/<slug>/katalog`, yang memuat
// semuanya beserta pencarian dan saringan kategori. Dua halaman karena dua
// maksud: yang satu meyakinkan orang bahwa usaha ini sungguhan, yang satu
// membantunya menemukan barang tertentu.

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const umkm = await ambilUmkm(params.slug);
  if (!umkm || umkm.status === 'nonaktif') return { title: 'UMKM tidak ditemukan' };

  // Nama dan keterangan SELALU dari Profil usaha — sama seperti Hero.tsx yang
  // menguncinya. Hanya foto sampul yang masih dibaca dari blok hero, karena ia
  // aset terpisah yang sengaja bisa diunggah di penyunting halaman.
  const blok = halamanAtauBawaan(umkm.halaman, sumber(umkm), umkm.tataLetak);
  const hero = blok.find((b) => b.jenis === 'hero');
  const judul = umkm.nama;
  const deskripsi =
    umkm.bio?.trim() ||
    `Produk buatan ${umkm.nama} di Desa Langensari.`;
  const foto = normalisasiFotoUrl((hero?.jenis === 'hero' && hero.foto) || umkm.foto, 1200);

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

export default async function HalamanUmkm({ params }: { params: { slug: string } }) {
  const umkm = await ambilUmkm(params.slug);

  // Slug tak dikenal dan UMKM nonaktif diperlakukan sama: dari luar, keduanya
  // memang tidak ada. Membedakannya akan memberi tahu orang luar bahwa sebuah
  // UMKM pernah ada di situ.
  if (!umkm || umkm.status === 'nonaktif') notFound();

  const { produk, gagal: produkGagal } = await produkUmkm(umkm.id);

  const blok = halamanAtauBawaan(umkm.halaman, sumber(umkm), umkm.tataLetak);
  const konteks = { umkm, produk, produkGagal, tataLetak: umkm.tataLetak };
  const jangkar = jangkarHalaman(blok);

  return (
    // Tema dipasang di sini sebagai atribut, bukan gaya sebaris. Custom property
    // menurun ke seluruh isinya, jadi setiap `bg-aksen` di dalamnya ikut berganti
    // tanpa satu komponen pun tahu tema apa yang sedang dipakai.
    <BingkaiTemaUmkm tema={umkm.tema} tataLetak={umkm.tataLetak}>
      <HeaderUmkm nama={umkm.nama} foto={umkm.foto} slug={umkm.slug} />
      <main className="min-h-[60vh]">
        {blok.map((b) => (
          <RenderBlok key={b.id} blok={b} konteks={konteks} jangkar={jangkar.get(b.id)} />
        ))}
      </main>
      <Footer />
    </BingkaiTemaUmkm>
  );
}
