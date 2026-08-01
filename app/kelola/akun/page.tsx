import { redirect } from 'next/navigation';
import { wajibSesi } from '@/lib/sesi';
import { ambilAkunSemua, ambilUmkmSemua } from '@/lib/backend';
import { Galat } from '../Kotak';
import DaftarAkun from './DaftarAkun';

export const metadata = { title: 'Akun' };

export default async function HalamanAkun({ searchParams }: { searchParams: { q?: string } }) {
  const sesi = wajibSesi();
  // Layout /kelola hanya memastikan sudah masuk. Pembatasan peran ada di sini,
  // dan jalur tulisnya dijaga terpisah di /api/akun — menebak alamat halaman
  // ini tidak cukup untuk mengubah apa pun.
  if (sesi.peran !== 'admin') redirect('/kelola');

  let akun: Awaited<ReturnType<typeof ambilAkunSemua>> = [];
  let umkm: Awaited<ReturnType<typeof ambilUmkmSemua>> = [];
  let gagal = '';
  try {
    [akun, umkm] = await Promise.all([ambilAkunSemua(), ambilUmkmSemua()]);
  } catch (err) {
    gagal = err instanceof Error ? err.message : 'Data tidak dapat dimuat.';
  }

  if (gagal) return <Galat pesan={gagal} />;

  return (
    <DaftarAkun
      akun={akun}
      daftarUmkm={umkm}
      akunSaya={sesi.akunId}
      kataKunci={searchParams.q ?? ''}
    />
  );
}
