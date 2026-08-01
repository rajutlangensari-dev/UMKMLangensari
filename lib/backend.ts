/**
 * Jembatan server Next.js ke Apps Script.
 *
 * HANYA BOLEH DIIMPOR DARI KODE SERVER (Route Handler, Server Component,
 * middleware). File ini memegang `APPS_SCRIPT_SECRET`, dan variabel itu sengaja
 * tanpa awalan `NEXT_PUBLIC_` supaya tidak ikut terbundel ke browser.
 *
 * Alasan lapisan ini ada: sebelumnya browser memanggil Apps Script langsung
 * sambil membawa kata sandi admin, sehingga kata sandi tercatat di query string,
 * riwayat peramban, dan log. Sekarang browser hanya bicara ke Next.js, dan
 * Next.js yang bicara ke Apps Script dengan rahasia server-ke-server.
 */

import type { Umkm, Akun, Peran, Produk } from './types';
import { bacaHalaman, bacaTema, bacaTataLetak } from './blok';

const URL_BACKEND = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
const RAHASIA = process.env.APPS_SCRIPT_SECRET;

/** Akun beserta hash sandinya. Hanya dipakai proses login, tidak pernah dikirim ke browser. */
export interface AkunRahasia extends Akun {
  hashSandi: string;
  gagal: number;
  gagalTerakhir: string;
}

async function panggil<T>(action: string, data?: Record<string, unknown>): Promise<T> {
  if (!URL_BACKEND) throw new Error('NEXT_PUBLIC_APPS_SCRIPT_URL belum diatur.');
  if (!RAHASIA) throw new Error('APPS_SCRIPT_SECRET belum diatur di .env.local.');

  const res = await fetch(URL_BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, rahasia: RAHASIA, data }),
    cache: 'no-store',
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Permintaan ke backend gagal.');
  return json.data as T;
}

// ---------- UMKM ----------

/**
 * `halaman` datang dari sheet sebagai TEKS JSON, dan `tema`/`tataLetak` sebagai
 * teks bebas yang bisa saja diketik tangan di spreadsheet. Ketiganya diuraikan
 * dan divalidasi tepat di sini — satu pintu masuk — supaya tidak ada pemanggil
 * yang perlu jaga-jaga sendiri, dan tidak ada yang kelewat.
 */
function normalisasiUmkm(r: Record<string, unknown>): Umkm {
  return {
    id: String(r.id ?? ''),
    slug: String(r.slug ?? ''),
    nama: String(r.nama ?? ''),
    bio: String(r.bio ?? ''),
    foto: String(r.foto ?? ''),
    kontakWa: String(r.kontakWa ?? ''),
    alamat: String(r.alamat ?? ''),
    status: String(r.status ?? 'aktif') === 'nonaktif' ? 'nonaktif' : 'aktif',
    dibuat: String(r.dibuat ?? ''),
    halaman: bacaHalaman(r.halaman),
    tema: bacaTema(r.tema),
    tataLetak: bacaTataLetak(r.tataLetak),
  };
}

export async function ambilUmkmSemua(): Promise<Umkm[]> {
  const baris = await panggil<Record<string, unknown>[]>('portal.daftarUmkm', {});
  return baris.map(normalisasiUmkm);
}

export async function ambilUmkmAktif(): Promise<Umkm[]> {
  const baris = await panggil<Record<string, unknown>[]>('portal.daftarUmkm', { hanyaAktif: true });
  return baris.map(normalisasiUmkm);
}

export async function ambilUmkmBySlug(slug: string): Promise<Umkm | null> {
  const semua = await ambilUmkmSemua();
  return semua.find((u) => u.slug === slug) ?? null;
}

export async function buatUmkm(data: Record<string, unknown>): Promise<Umkm> {
  return normalisasiUmkm(await panggil<Record<string, unknown>>('portal.buatUmkm', data));
}

export async function perbaruiUmkm(data: Record<string, unknown>): Promise<Umkm> {
  return normalisasiUmkm(await panggil<Record<string, unknown>>('portal.perbaruiUmkm', data));
}

// ---------- Produk ----------

/** Seluruh produk termasuk yang nonaktif. Untuk panel; jangan dipakai halaman publik. */
export async function ambilProdukSemuaServer(): Promise<Produk[]> {
  const baris = await panggil<Record<string, unknown>[]>('portal.daftarProduk');
  return baris.map((r) => ({
    id: String(r.id ?? ''),
    namaProduk: String(r.namaProduk ?? ''),
    kategori: String(r.kategori ?? ''),
    harga: Number(r.harga) || 0,
    stok: String(r.stok ?? ''),
    deskripsi: String(r.deskripsi ?? ''),
    foto: String(r.foto ?? ''),
    kontakWa: String(r.kontakWa ?? ''),
    namaUmkm: String(r.namaUmkm ?? ''),
    umkmId: String(r.umkmId ?? ''),
    alamat: String(r.alamat ?? ''),
    status: String(r.status ?? ''),
  }));
}

export const buatProdukServer = (data: Record<string, unknown>) =>
  panggil<unknown>('portal.buatProduk', data);

export const perbaruiProdukServer = (data: Record<string, unknown>) =>
  panggil<unknown>('portal.perbaruiProduk', data);

export const hapusProdukServer = (id: string) =>
  panggil<unknown>('portal.hapusProduk', { id });

// ---------- Akun ----------

export const ambilAkunUntukMasuk = (namaPengguna: string) =>
  panggil<AkunRahasia | null>('portal.akunUntukMasuk', { namaPengguna });

export const ambilAkunSemua = () => panggil<Akun[]>('portal.daftarAkun');

export const buatAkun = (data: {
  namaPengguna: string;
  hashSandi: string;
  peran: Peran;
  umkmId?: string;
}) => panggil<Akun>('portal.buatAkun', data);

export const perbaruiAkun = (data: { id: string; hashSandi?: string; status?: string }) =>
  panggil<Akun>('portal.perbaruiAkun', data);

// ---------- Foto ----------

/**
 * Minta backend menghapus foto yang tidak jadi dipakai.
 *
 * Ini PERMINTAAN, bukan perintah. Apps Script memeriksa dulu apakah URL-nya
 * masih dipakai baris mana pun (produk, profil UMKM, atau di dalam susunan
 * halaman siapa pun); yang masih dipakai tidak disentuh. Karena itu memanggilnya
 * dengan URL yang salah tidak bisa merusak halaman siapa pun — paling banter
 * tidak terjadi apa-apa.
 */
export const sapuFotoServer = (url: string | string[]) =>
  panggil<{ url: string; status: string }[]>('portal.sapuFoto', { url });

export const catatMasuk = (id: string, berhasil: boolean) =>
  panggil<unknown>('portal.catatMasuk', { id, berhasil });
