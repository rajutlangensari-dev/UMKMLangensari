/**
 * Penomoran pengenal usaha: `umkm-langensari-1`, `-2`, dan seterusnya.
 *
 * Dua puluh lima usaha pertama sudah memakai pola ini untuk slug SEKALIGUS nama
 * pengguna akunnya, jadi pendaftaran berikutnya melanjutkannya. Pola yang cuma
 * berlaku sejak pendaftaran ke-26 berarti dua sistem penamaan hidup berdampingan
 * di satu daftar, dan yang membacanya harus tahu di mana batasnya.
 *
 * Berkas terpisah supaya bisa diuji langsung di Node. Kalau ia tinggal di dalam
 * komponen halaman, ia ikut menyeret `next/navigation` dan seluruh pohon
 * komponennya, dan tidak ada uji yang bisa menyentuhnya.
 */

export const AWALAN_PENGENAL = 'umkm-langensari';

/**
 * Pengenal berikutnya yang belum dipakai.
 *
 * Dihitung dari nomor TERBESAR yang sudah ada, bukan dari jumlah barisnya. Satu
 * usaha yang dihapus, atau nomor yang pernah dilewati, membuat hitungan jumlah
 * mengusulkan slug milik orang lain — dan pendaftarannya ditolak backend dengan
 * galat yang tidak berarti apa-apa bagi yang sedang mengisi formulir.
 *
 * Usaha nonaktif ikut dihitung, jadi nomornya tidak pernah dipakai ulang.
 * Halaman yang sudah pernah dibagikan di WhatsApp tidak boleh tiba-tiba
 * menunjuk usaha yang berbeda.
 *
 * Slug di luar pola (`bubur-bu-cicah`) diabaikan, bukan dianggap salah. Keduanya
 * boleh hidup berdampingan; yang dihitung hanya yang bernomor.
 */
export function pengenalBerikutnya(slugTerpakai: readonly string[]): string {
  const pola = new RegExp(`^${AWALAN_PENGENAL}-(\\d+)$`);
  let tertinggi = 0;
  for (const slug of slugTerpakai) {
    const cocok = String(slug || '').trim().toLowerCase().match(pola);
    if (cocok) tertinggi = Math.max(tertinggi, Number(cocok[1]));
  }
  return `${AWALAN_PENGENAL}-${tertinggi + 1}`;
}
