/**
 * Cookie tampilan: siapa yang sedang masuk, untuk DILIHAT saja.
 *
 * KENAPA ADA COOKIE KEDUA
 *
 * Header muncul di halaman publik, dan tiga di antaranya — `/panduan`,
 * `/tentang`, `/masuk` — dirender statis saat build. `/panduan` adalah halaman
 * tujuan QR yang sudah tercetak dan dibagikan; ia harus terbuka seketika.
 * Membaca cookie sesi di sisi server memaksa ketiganya jadi dinamis, artinya
 * tiap kunjungan menunggu server — harga yang mahal untuk memindahkan satu
 * tombol yang hanya dilihat belasan orang.
 *
 * Jadi header membacanya di peramban, dari cookie ini.
 *
 * KENAPA INI TIDAK MELEMAHKAN APA PUN
 *
 * Cookie ini TIDAK MEMBERI HAK APA PUN. Ia tidak bertanda tangan, tidak dipakai
 * memutuskan apa pun di server, dan tidak pernah dibaca oleh kode yang menjaga
 * `/kelola` maupun `/api/*`. Yang menjaga semua itu tetap cookie `sesi` yang
 * httpOnly dan bertanda tangan HMAC.
 *
 * Orang yang mengarang isi cookie ini hanya mengubah nama yang tampil di
 * layarnya sendiri. Begitu ia mengetuk tombolnya, `/kelola` memeriksa tanda
 * tangan sesi yang asli dan memulangkannya ke `/masuk`.
 *
 * Karena itu isinya harus tetap sekadar tempelan nama: JANGAN pernah menambahkan
 * sesuatu ke sini yang kode server akan percayai, sekecil apa pun.
 */

import type { Peran } from './types';

export const NAMA_COOKIE_TAMPILAN = 'pengguna';

/**
 * Opsi cookie-nya ikut di berkas ini, bukan di `lib/auth.ts`.
 *
 * Bukan soal rapi: `lib/auth.ts` memakai `node:crypto` dan hanya boleh berjalan
 * di server, sementara berkas ini dibaca peramban juga. Kalau `auth.ts`
 * mengimpor nilai dari sini, arah ketergantungannya jadi server → klien, dan
 * skrip uji yang menjalankan `auth.ts` langsung di Node berhenti bekerja.
 *
 * `httpOnly: false` DISENGAJA — itu justru intinya. Umurnya disamakan dengan
 * sesi supaya keduanya kedaluwarsa bersamaan; kalau tidak, akan ada keadaan di
 * mana nama masih tampil di header padahal sesinya sudah mati.
 */
export const opsiCookieTampilan = {
  name: NAMA_COOKIE_TAMPILAN,
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

export interface Tampilan {
  nama: string;
  peran: Peran;
}

/** Nilai cookie. Dipendekkan kuncinya karena ia ikut di tiap permintaan. */
export function tulisTampilan(t: Tampilan): string {
  return encodeURIComponent(JSON.stringify({ n: t.nama, p: t.peran }));
}

/**
 * Kebalikannya, dan TIDAK PERNAH melempar.
 *
 * Isinya bisa diketik tangan siapa pun lewat konsol peramban. Satu galat di
 * sini akan menjatuhkan header di setiap halaman publik — jadi apa pun yang
 * tidak dipahami diperlakukan sama dengan belum masuk.
 */
export function bacaTampilan(nilai: string | undefined | null): Tampilan | null {
  if (!nilai) return null;
  try {
    const m = JSON.parse(decodeURIComponent(nilai)) as Record<string, unknown>;
    const nama = typeof m.n === 'string' ? m.n.trim().slice(0, 60) : '';
    const peran = m.p === 'admin' ? 'admin' : m.p === 'umkm' ? 'umkm' : null;
    if (!nama || !peran) return null;
    return { nama, peran };
  } catch {
    return null;
  }
}

/** Baca dari `document.cookie`. Hanya dipanggil di peramban. */
export function tampilanDariDokumen(): Tampilan | null {
  if (typeof document === 'undefined') return null;
  const potong = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${NAMA_COOKIE_TAMPILAN}=`));
  return bacaTampilan(potong?.slice(NAMA_COOKIE_TAMPILAN.length + 1));
}

/** Huruf untuk avatar, seperti media sosial saat penggunanya belum berfoto. */
export function inisial(nama: string): string {
  return nama.trim().charAt(0).toUpperCase() || '?';
}
