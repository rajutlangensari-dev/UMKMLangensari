import { redirect } from 'next/navigation';
import { wajibSesi } from '@/lib/sesi';
import { ambilUmkmSemua } from '@/lib/backend';
import { Galat, Judul, Kosong } from '../Kotak';
import FormProfilUmkm from './FormProfilUmkm';

export const metadata = { title: 'Profil usaha' };

export default async function HalamanProfilUsaha() {
  const sesi = wajibSesi();

  // Super admin tidak lagi punya halaman profil tersendiri: menyunting profil
  // usaha mana pun sekarang ada di halaman detail usahanya, bersama produk dan
  // akunnya. Satu pekerjaan, satu tempat.
  if (sesi.peran === 'admin') redirect('/kelola/umkm');

  let umkm: Awaited<ReturnType<typeof ambilUmkmSemua>> = [];
  let gagal = '';
  try {
    umkm = await ambilUmkmSemua();
  } catch (err) {
    gagal = err instanceof Error ? err.message : 'Data tidak dapat dimuat.';
  }

  if (gagal) return <Galat pesan={gagal} />;

  // Pemilik UMKM hanya menerima barisnya sendiri. Mengirim seluruh daftar ke
  // browser lalu menyaringnya di sana berarti data usaha lain tetap sampai ke
  // perangkatnya, dan tinggal dibuka lewat alat pengembang.
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
    <div className="space-y-6">
      <Judul sub="Yang diisi di sini dipakai halaman publik Anda dan mengisi otomatis produk baru.">
        Profil usaha
      </Judul>
      <FormProfilUmkm umkm={saya} />
    </div>
  );
}
