/**
 * Kata sandi dan sesi. HANYA UNTUK KODE SERVER.
 *
 * Memakai `node:crypto` bawaan, tanpa dependency tambahan. Alasannya bukan
 * sekadar hemat: proyek ini diserahkan ke perangkat desa setelah KKN selesai,
 * dan setiap paket npm yang dipasang hari ini adalah paket yang harus diperbarui
 * orang lain nanti. `scrypt` dan `hmac` di stdlib Node sudah persis alat yang
 * dibutuhkan, jadi tidak ada alasan menambah bcrypt atau iron-session.
 *
 * Yang TIDAK boleh dilakukan di sini: menulis fungsi hash sendiri. Semua di
 * bawah ini memakai primitif standar apa adanya.
 */

// Berkas ini sengaja tidak mengimpor apa pun dari `next/*`. Isinya primitif
// murni, jadi bisa dijalankan langsung di Node untuk diuji. Perekatan ke
// Next.js (membaca cookie permintaan) ada di `lib/sesi.ts`.
import { randomBytes, scrypt, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import type { Sesi } from './types';

const scryptAsync = promisify(scrypt) as (
  sandi: string,
  garam: Buffer,
  panjang: number
) => Promise<Buffer>;

const PANJANG_HASH = 64;
const NAMA_COOKIE = 'sesi';
const UMUR_SESI_DETIK = 7 * 24 * 60 * 60;

export const SANDI_MIN = 10;

// ---------- Kata sandi ----------

/**
 * Hasilnya berbentuk `scrypt$<garam hex>$<hash hex>`.
 *
 * Garam disimpan menyatu dengan hash, bukan di kolom terpisah, supaya tidak
 * mungkin ada baris yang punya hash tapi kehilangan garamnya.
 */
export async function hashSandi(sandi: string): Promise<string> {
  const garam = randomBytes(16);
  const hash = await scryptAsync(sandi, garam, PANJANG_HASH);
  return `scrypt$${garam.toString('hex')}$${hash.toString('hex')}`;
}

/** Selalu memakai perbandingan waktu tetap, supaya lama proses tidak membocorkan isi hash. */
export async function verifikasiSandi(sandi: string, tersimpan: string): Promise<boolean> {
  const bagian = String(tersimpan || '').split('$');
  if (bagian.length !== 3 || bagian[0] !== 'scrypt') return false;

  let garam: Buffer;
  let asli: Buffer;
  try {
    garam = Buffer.from(bagian[1], 'hex');
    asli = Buffer.from(bagian[2], 'hex');
  } catch {
    return false;
  }
  if (asli.length !== PANJANG_HASH) return false;

  const hitung = await scryptAsync(sandi, garam, PANJANG_HASH);
  return timingSafeEqual(hitung, asli);
}

/** Kata sandi awal yang diserahkan ke pemilik UMKM. Dibacakan lewat telepon, jadi tanpa karakter rancu. */
export function sandiAcak(): string {
  const abjad = 'abcdefghjkmnpqrstuvwxyz23456789';
  const acak = randomBytes(12);
  let hasil = '';
  for (let i = 0; i < 12; i++) hasil += abjad[acak[i] % abjad.length];
  return hasil;
}

// ---------- Sesi ----------

function rahasiaSesi(): Buffer {
  const nilai = process.env.SESSION_SECRET;
  if (!nilai || nilai.length < 32) {
    throw new Error('SESSION_SECRET belum diatur atau kurang dari 32 karakter. Lihat .env.example.');
  }
  return Buffer.from(nilai, 'utf8');
}

const b64 = (b: Buffer) => b.toString('base64url');

function tandaTangan(muatan: string): string {
  return createHmac('sha256', rahasiaSesi()).update(muatan).digest('base64url');
}

/**
 * Token ditandatangani, bukan dienkripsi. Isinya memang tidak rahasia — id akun,
 * peran, dan id UMKM. Yang dijaga adalah keasliannya: tanpa `SESSION_SECRET`
 * tidak ada yang bisa mengaku sebagai admin.
 */
export function buatToken(sesi: Sesi): string {
  const isi = { ...sesi, exp: Math.floor(Date.now() / 1000) + UMUR_SESI_DETIK };
  const muatan = b64(Buffer.from(JSON.stringify(isi), 'utf8'));
  return `${muatan}.${tandaTangan(muatan)}`;
}

export function bacaToken(token: string | undefined): Sesi | null {
  if (!token) return null;
  const [muatan, tanda] = token.split('.');
  if (!muatan || !tanda) return null;

  // Tanda tangan diperiksa lebih dulu, sebelum isinya dipercaya sedikit pun.
  const harusnya = Buffer.from(tandaTangan(muatan), 'utf8');
  const diberikan = Buffer.from(tanda, 'utf8');
  if (harusnya.length !== diberikan.length) return null;
  if (!timingSafeEqual(harusnya, diberikan)) return null;

  try {
    const isi = JSON.parse(Buffer.from(muatan, 'base64url').toString('utf8'));
    if (typeof isi.exp !== 'number' || isi.exp * 1000 < Date.now()) return null;
    if (isi.peran !== 'admin' && isi.peran !== 'umkm') return null;
    return {
      akunId: String(isi.akunId || ''),
      namaPengguna: String(isi.namaPengguna || ''),
      peran: isi.peran,
      umkmId: String(isi.umkmId || ''),
    };
  } catch {
    return null;
  }
}

export const opsiCookie = {
  name: NAMA_COOKIE,
  httpOnly: true,
  // Di pengembangan lokal alamatnya http, jadi cookie ber-Secure tidak akan
  // pernah terkirim balik dan login selalu terlihat gagal.
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: UMUR_SESI_DETIK,
};

export { NAMA_COOKIE, UMUR_SESI_DETIK };

// ---------- Pembatasan percobaan ----------

export const MAKS_GAGAL = 5;
const JEDA_KUNCI_MS = 15 * 60 * 1000;

/** Terkunci hanya kalau kegagalan sudah cukup banyak DAN yang terakhir masih baru. */
export function sedangTerkunci(gagal: number, gagalTerakhir: string): boolean {
  if (!gagal || gagal < MAKS_GAGAL) return false;
  const waktu = Date.parse(gagalTerakhir);
  if (Number.isNaN(waktu)) return false;
  return Date.now() - waktu < JEDA_KUNCI_MS;
}
