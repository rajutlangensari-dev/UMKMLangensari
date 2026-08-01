import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { butuhSesi } from '@/lib/otorisasi';
import { buatProdukServer } from '@/lib/backend';
import { TAG_PRODUK } from '@/lib/publik';

export async function POST(request: Request) {
  const hasil = butuhSesi();
  if ('tolak' in hasil) return hasil.tolak;
  const { sesi } = hasil;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak terbaca.' }, { status: 400 });
  }

  // Peran `umkm` selalu menulis ke UMKM-nya sendiri, apa pun yang dikirim di
  // badan permintaan. Super admin memilih, dan wajib memilih: produk tanpa
  // pemilik tidak akan pernah muncul di halaman UMKM mana pun.
  const umkmId = sesi.peran === 'admin' ? String(body.umkmId || '') : sesi.umkmId;
  if (!umkmId) {
    return NextResponse.json({ error: 'Pilih dulu pemilik produknya.' }, { status: 400 });
  }
  if (!String(body.namaProduk || '').trim()) {
    return NextResponse.json({ error: 'Nama produk wajib diisi.' }, { status: 400 });
  }

  try {
    const data = await buatProdukServer({ ...body, umkmId });
    // Cache halaman publik dibuang SETELAH backend menjawab berhasil, bukan
    // sebelum. Membuangnya lebih dulu berarti kegagalan penyimpanan tetap
    // memaksa pengunjung berikutnya menanggung 4 detik ke Apps Script demi data
    // yang ternyata tidak berubah sama sekali.
    revalidateTag(TAG_PRODUK);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('Gagal membuat produk:', err);
    return NextResponse.json({ error: 'Produk tidak dapat disimpan.' }, { status: 500 });
  }
}
