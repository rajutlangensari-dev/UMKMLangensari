import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { bolehSentuhProduk, butuhSesi } from '@/lib/otorisasi';
import { hapusProdukServer, perbaruiProdukServer } from '@/lib/backend';
import { TAG_PRODUK } from '@/lib/publik';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const hasil = butuhSesi();
  if ('tolak' in hasil) return hasil.tolak;

  const tolak = await bolehSentuhProduk(hasil.sesi, params.id);
  if (tolak) return tolak;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak terbaca.' }, { status: 400 });
  }

  // `umkmId` dibuang dari badan permintaan untuk peran umkm: memindahkan produk
  // ke UMKM lain adalah wewenang super admin, dan kalau dibiarkan lewat, satu
  // pemilik bisa menyerahkan produknya ke halaman orang lain.
  if (hasil.sesi.peran !== 'admin') delete body.umkmId;

  try {
    const data = await perbaruiProdukServer({ ...body, id: params.id });
    // Cache halaman publik dibuang SETELAH backend menjawab berhasil, bukan
    // sebelum. Membuangnya lebih dulu berarti kegagalan penyimpanan tetap
    // memaksa pengunjung berikutnya menanggung 4 detik ke Apps Script demi data
    // yang ternyata tidak berubah sama sekali.
    revalidateTag(TAG_PRODUK);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('Gagal memperbarui produk:', err);
    return NextResponse.json({ error: 'Perubahan tidak dapat disimpan.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const hasil = butuhSesi();
  if ('tolak' in hasil) return hasil.tolak;

  const tolak = await bolehSentuhProduk(hasil.sesi, params.id);
  if (tolak) return tolak;

  try {
    await hapusProdukServer(params.id);
    revalidateTag(TAG_PRODUK);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Gagal menghapus produk:', err);
    return NextResponse.json({ error: 'Produk tidak dapat dihapus.' }, { status: 500 });
  }
}
