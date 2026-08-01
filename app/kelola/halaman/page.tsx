import { redirect } from 'next/navigation';
import { wajibSesi } from '@/lib/sesi';
import { ambilProdukSemuaServer, ambilUmkmSemua } from '@/lib/backend';
import { Galat, Kosong } from '../Kotak';
import PenyuntingHalaman from './PenyuntingHalaman';

export const metadata = { title: 'Susun halaman' };

/** Penyunting halaman milik pemilik UMKM sendiri. */
export default async function HalamanSaya() {
  const sesi = wajibSesi();
  // Super admin menyusun halaman lewat detail usahanya, bukan lewat sini —
  // di sana dia sudah memilih usaha mana yang sedang diurus.
  if (sesi.peran === 'admin') redirect('/kelola/umkm');

  let umkm: Awaited<ReturnType<typeof ambilUmkmSemua>> = [];
  let produk: Awaited<ReturnType<typeof ambilProdukSemuaServer>> = [];
  let gagal = '';
  try {
    [umkm, produk] = await Promise.all([ambilUmkmSemua(), ambilProdukSemuaServer()]);
  } catch (err) {
    gagal = err instanceof Error ? err.message : 'Data tidak dapat dimuat.';
  }
  if (gagal) return <Galat pesan={gagal} />;

  // Pemilik hanya menerima barisnya sendiri, disaring DI SERVER.
  const saya = umkm.find((u) => u.id === sesi.umkmId);
  if (!saya) {
    return (
      <Kosong
        judul="Akun ini belum terhubung ke usaha mana pun"
        jelas="Hubungi super admin portal supaya akun Anda ditautkan ke usaha yang benar."
      />
    );
  }

  return (
    <PenyuntingHalaman
      umkm={saya}
      produk={produk.filter((p) => p.umkmId === saya.id && p.status.toLowerCase() === 'aktif')}
      kembali={{ href: '/kelola', label: 'Beranda panel' }}
    />
  );
}
