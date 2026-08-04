import { wajibSesi } from '@/lib/sesi';
import FormGantiSandi from './FormGantiSandi';
import FormNamaPengguna from './FormNamaPengguna';

export const metadata = { title: 'Kata sandi' };

export default function HalamanGantiSandi() {
  const sesi = wajibSesi();
  return (
    <>
      <FormGantiSandi />
      {/* Satu halaman untuk dua pengenal masuk. Memisahnya jadi halaman
          tersendiri berarti satu butir menu lagi untuk hal yang disentuh
          sekali seumur akun. */}
      <FormNamaPengguna sekarang={sesi.namaPengguna} />
    </>
  );
}
