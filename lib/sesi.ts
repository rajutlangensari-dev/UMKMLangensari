import { cookies } from 'next/headers';
import { bacaToken, NAMA_COOKIE } from './auth';
import type { Sesi } from './types';

/**
 * Sesi pemanggil, atau null kalau belum masuk.
 *
 * Ini gerbang keamanan yang sebenarnya, dan sengaja BUKAN middleware.
 * Middleware Next.js 14 berjalan di runtime Edge, tempat `node:crypto` tidak
 * tersedia, jadi tanda tangan token tidak bisa diperiksa di sana. Middleware
 * yang hanya melihat "ada cookie atau tidak" memberi rasa aman palsu.
 */
export function sesiSaatIni(): Sesi | null {
  return bacaToken(cookies().get(NAMA_COOKIE)?.value);
}

/**
 * Sesi yang wajib ada.
 *
 * Dipakai di halaman dan Route Handler yang menulis data. Route Handler tetap
 * harus memanggil ini sendiri walaupun halamannya sudah dijaga layout:
 * permintaan bisa dikirim langsung ke `/api/...` tanpa membuka halaman mana pun.
 */
export function wajibSesi(): Sesi {
  const sesi = sesiSaatIni();
  if (!sesi) throw new Error('Belum masuk.');
  return sesi;
}
