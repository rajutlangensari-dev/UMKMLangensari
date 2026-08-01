import { NextResponse } from 'next/server';
import { butuhSesi } from '@/lib/otorisasi';
import { sapuFotoServer } from '@/lib/backend';

/**
 * Buang foto yang sudah diunggah tapi tidak jadi dipakai.
 *
 * Kenapa perlu: unggahan ke Cloudinary terjadi begitu foto dipilih, jauh sebelum
 * tombol Simpan ditekan. Kalau orangnya lalu mengganti fotonya, menekan tombol
 * buang, atau membatalkan formulirnya, berkas itu tinggal selamanya di Cloudinary
 * tanpa ada satu baris pun yang menyebutnya — jadi tidak ada pembandingan
 * lama-vs-baru yang bisa menemukannya nanti.
 *
 * KENAPA INI TIDAK BERBAHAYA MESKI SIAPA PUN YANG SUDAH MASUK BISA MEMANGGILNYA
 * DENGAN URL APA SAJA:
 *
 * Yang menghapus adalah `portalSapuFoto_` di Apps Script, dan ia memeriksa dulu
 * apakah URL-nya masih dipakai baris mana pun — produk siapa pun, profil UMKM
 * siapa pun, atau di dalam susunan halaman siapa pun. Yang masih dipakai tidak
 * disentuh. Jadi yang bisa dihapus lewat jalur ini HANYA berkas yang memang sudah
 * tidak ditunjuk apa-apa, dan menghapusnya persis itulah gunanya.
 *
 * Karena itu di sini cukup `butuhSesi()`: tidak ada gunanya memeriksa
 * kepemilikan atas berkas yang menurut definisinya tidak dimiliki baris mana pun.
 *
 * Balasannya selalu 200 selama sesinya sah. Pemanggilnya menembak-dan-lupa —
 * gagal menyapu satu foto tidak boleh menggagalkan pekerjaan yang sedang
 * dikerjakan orangnya.
 */
export async function POST(request: Request) {
  const hasil = butuhSesi();
  if ('tolak' in hasil) return hasil.tolak;

  let url: string[] = [];
  try {
    const body = await request.json();
    const mentah = Array.isArray(body.url) ? body.url : [body.url];
    url = mentah
      .filter((u: unknown): u is string => typeof u === 'string')
      // Disaring di sini juga, bukan cuma di Apps Script: tidak ada gunanya
      // membangunkan backend untuk sel kosong atau tempelan link Google Drive.
      .filter((u: string) => u.includes('res.cloudinary.com'))
      .slice(0, 32);
  } catch {
    return NextResponse.json({ ok: true, disapu: 0 });
  }

  if (url.length === 0) return NextResponse.json({ ok: true, disapu: 0 });

  try {
    const hasilSapu = await sapuFotoServer(url);
    return NextResponse.json({ ok: true, disapu: hasilSapu.length, hasil: hasilSapu });
  } catch (err) {
    console.error('Gagal menyapu foto:', err);
    return NextResponse.json({ ok: true, disapu: 0 });
  }
}
