import type { Produk, Umkm } from './types';

/**
 * Kolom produk yang memang dikelola melalui formulir produk.
 *
 * Nama usaha, nomor WhatsApp, dan alamat sengaja tidak termasuk. Ketiganya
 * berasal dari Profil usaha. Kolom lama di sheet tetap dibaca sebagai cadangan
 * untuk produk lawas yang belum mempunyai `umkmId`.
 */
const KOLOM_FORM_PRODUK = [
  'namaProduk',
  'kategori',
  'harga',
  'stok',
  'deskripsi',
  'foto',
  'status',
] as const;

export function dataProdukDariPermintaan(
  body: Record<string, unknown>
): Record<string, unknown> {
  const hasil: Record<string, unknown> = {};
  for (const k of KOLOM_FORM_PRODUK) {
    if (body[k] !== undefined) hasil[k] = body[k];
  }
  if (hasil.namaProduk !== undefined) {
    hasil.namaProduk = String(hasil.namaProduk).trim();
  }
  return hasil;
}

/**
 * Hubungkan produk dengan Profil usaha terbaru tanpa mengubah data asal.
 *
 * Data lawas yang belum memiliki pemilik tetap memakai salinan pada baris
 * produk. Begitu `umkmId` tersedia, Profil usaha menjadi sumber utamanya.
 */
export function produkDenganProfil(produk: Produk[], daftarUmkm: Umkm[]): Produk[] {
  const profil = new Map(daftarUmkm.map((u) => [u.id, u]));

  return produk.map((p) => {
    const usaha = p.umkmId ? profil.get(p.umkmId) : undefined;
    if (!usaha) return p;

    return {
      ...p,
      namaUmkm: usaha.nama,
      kontakWa: usaha.kontakWa,
      alamat: usaha.alamat,
    };
  });
}
