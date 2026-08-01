import { notFound, redirect } from 'next/navigation';
import { wajibSesi } from '@/lib/sesi';
import { ambilProdukSemuaServer, ambilUmkmSemua } from '@/lib/backend';
import { Galat } from '../../../Kotak';
import PenyuntingHalaman from '../../../halaman/PenyuntingHalaman';

export const metadata = { title: 'Susun halaman usaha' };

/** Penyunting halaman usaha mana pun, untuk super admin. */
export default async function HalamanUsaha({ params }: { params: { id: string } }) {
  const sesi = wajibSesi();
  if (sesi.peran !== 'admin') redirect('/kelola/halaman');

  let umkm: Awaited<ReturnType<typeof ambilUmkmSemua>> = [];
  let produk: Awaited<ReturnType<typeof ambilProdukSemuaServer>> = [];
  let gagal = '';
  try {
    [umkm, produk] = await Promise.all([ambilUmkmSemua(), ambilProdukSemuaServer()]);
  } catch (err) {
    gagal = err instanceof Error ? err.message : 'Data tidak dapat dimuat.';
  }
  if (gagal) return <Galat pesan={gagal} />;

  const usaha = umkm.find((u) => u.id === params.id);
  if (!usaha) notFound();

  return (
    <PenyuntingHalaman
      umkm={usaha}
      produk={produk.filter((p) => p.umkmId === usaha.id && p.status.toLowerCase() === 'aktif')}
      kembali={{ href: `/kelola/umkm/${usaha.id}`, label: usaha.nama }}
    />
  );
}
