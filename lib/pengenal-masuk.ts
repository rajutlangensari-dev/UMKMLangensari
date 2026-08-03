import type { Akun, Umkm } from './types';

type AkunRingkas = Pick<Akun, 'namaPengguna' | 'peran' | 'umkmId' | 'status'>;
type UmkmRingkas = Pick<Umkm, 'id' | 'nama'>;

/**
 * Bentuk pembanding untuk nama usaha.
 *
 * Huruf besar-kecil dan spasi ganda tidak boleh membuat nama yang terlihat
 * sama gagal dipakai untuk masuk. Tanda baca tetap dipertahankan agar dua nama
 * berbeda tidak melebur menjadi satu alias.
 */
export function kunciNamaMasuk(nilai: string): string {
  return String(nilai || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Temukan username akun aktif dari nama usaha yang diketik saat masuk.
 *
 * Hanya kecocokan tunggal yang diterima. Kalau dua usaha memakai nama sama,
 * atau satu usaha memiliki lebih dari satu akun aktif, sistem tidak menebak
 * akun mana yang dimaksud. Username asli tetap dapat dipakai pada keadaan itu.
 */
export function namaPenggunaDariNamaUsaha(
  masukan: string,
  daftarAkun: AkunRingkas[],
  daftarUmkm: UmkmRingkas[]
): string | null {
  const kunci = kunciNamaMasuk(masukan);
  if (!kunci) return null;

  const usahaCocok = daftarUmkm.filter((usaha) => kunciNamaMasuk(usaha.nama) === kunci);
  if (usahaCocok.length !== 1) return null;

  const akunCocok = daftarAkun.filter(
    (akun) =>
      akun.peran === 'umkm' &&
      akun.umkmId === usahaCocok[0].id &&
      akun.status === 'aktif'
  );
  return akunCocok.length === 1 ? akunCocok[0].namaPengguna : null;
}
