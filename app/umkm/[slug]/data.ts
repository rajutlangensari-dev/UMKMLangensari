/**
 * Pengambilan data yang dipakai bersama halaman utama usaha dan halaman
 * katalognya.
 *
 * BUKAN modul klien, dan tidak boleh jadi modul klien. Kalau `'use client'`
 * pernah ditambahkan di atas berkas ini, semua ekspornya berubah menjadi
 * referensi klien dan halaman yang mengimpornya gagal dengan
 * "ambilUmkm is not a function" — galat yang tidak bisa ditangkap `tsc`, `lint`,
 * maupun `build`, karena rute-rute ini dinamis dan tidak pernah dijalankan saat
 * build. Ini pernah terjadi sekali di panel; jangan diulang.
 *
 * `cache()` menyatukan pemanggilan yang sama dalam satu render, jadi
 * `generateMetadata` dan komponen halamannya berbagi satu permintaan ke Apps
 * Script, bukan dua. Kuotanya bukan milik kita.
 */

import { cache } from 'react';

import { produkPublik, umkmPublikBySlug } from '@/lib/publik';
import type { Produk, Umkm } from '@/lib/types';

export const ambilUmkm = cache(async (slug: string): Promise<Umkm | null> => {
  try {
    return await umkmPublikBySlug(slug);
  } catch {
    return null;
  }
});

/**
 * Produk aktif milik satu usaha.
 *
 * `gagal` dibedakan dari "kosong" dengan sengaja: yang pertama harus berbunyi
 * "periksa sambungan internet", yang kedua "belum ada produk". Menyamakan
 * keduanya membuat pemilik usaha yang barusan memasang lima produk melihat
 * halamannya berkata dia belum punya apa-apa.
 */
export const produkUmkm = cache(
  async (umkmId: string): Promise<{ produk: Produk[]; gagal: boolean }> => {
    try {
      const semua = await produkPublik();
      return { produk: semua.filter((p) => p.umkmId === umkmId), gagal: false };
    } catch {
      return { produk: [], gagal: true };
    }
  }
);

/** Sumber untuk susunan blok bawaan, dipakai kalau UMKM belum punya blok sendiri. */
export function sumber(u: Umkm) {
  return { nama: u.nama, bio: u.bio, foto: u.foto, alamat: u.alamat, kontakWa: u.kontakWa };
}
