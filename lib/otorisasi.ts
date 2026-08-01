import { NextResponse } from 'next/server';
import { sesiSaatIni } from './sesi';
import { ambilProdukSemuaServer } from './backend';
import type { Sesi } from './types';

/**
 * Penegakan hak akses untuk jalur tulis.
 *
 * Ada di berkas sendiri karena dipanggil dari beberapa Route Handler, dan kalau
 * disalin per berkas, satu salinan pasti akan tertinggal saat aturannya berubah.
 *
 * Layout `/kelola` menjaga TAMPILAN. Berkas ini menjaga DATA. Keduanya perlu:
 * permintaan bisa dikirim langsung ke `/api/...` dengan curl tanpa pernah
 * membuka satu halaman pun.
 */

export type HasilSesi = { sesi: Sesi } | { tolak: NextResponse };

export function butuhSesi(): HasilSesi {
  const sesi = sesiSaatIni();
  if (!sesi) {
    return { tolak: NextResponse.json({ error: 'Belum masuk.' }, { status: 401 }) };
  }
  return { sesi };
}

export function butuhAdmin(): HasilSesi {
  const hasil = butuhSesi();
  if ('tolak' in hasil) return hasil;
  if (hasil.sesi.peran !== 'admin') {
    return { tolak: NextResponse.json({ error: 'Butuh akses super admin.' }, { status: 403 }) };
  }
  return hasil;
}

/**
 * Boleh menyentuh produk ini?
 *
 * Super admin boleh semuanya. Peran `umkm` hanya boleh produk miliknya, dan
 * yang dibandingkan adalah `umkmId` yang TERSIMPAN DI SHEET, bukan yang dikirim
 * pemanggil — kalau memakai yang dikirim, siapa pun tinggal menuliskan umkmId
 * orang lain di badan permintaan.
 */
export async function bolehSentuhProduk(
  sesi: Sesi,
  produkId: string
): Promise<NextResponse | null> {
  if (sesi.peran === 'admin') return null;

  const semua = await ambilProdukSemuaServer();
  const produk = semua.find((p) => p.id === produkId);
  if (!produk) {
    return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }
  if (!produk.umkmId || produk.umkmId !== sesi.umkmId) {
    // Sengaja 404, bukan 403: memberi tahu "ada tapi bukan punyamu" berarti
    // memberi tahu id produk mana yang benar-benar ada.
    return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
  }
  return null;
}
