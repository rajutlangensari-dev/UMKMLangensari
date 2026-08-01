import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { butuhAdmin, butuhSesi } from '@/lib/otorisasi';
import { buatAkun, buatUmkm, perbaruiUmkm } from '@/lib/backend';
import { hashSandi, sandiAcak } from '@/lib/auth';
import { bacaTema, bacaTataLetak, halamanBawaan, tulisHalaman } from '@/lib/blok';
import { TAG_UMKM } from '@/lib/publik';

/**
 * Super admin mendaftarkan UMKM baru beserta akun pemiliknya, sekali jalan.
 *
 * Inilah yang membuat portal ini bisa tumbuh tanpa menulis kode: UMKM kedua,
 * ketiga, sampai kedua puluh masuk lewat sini, dan halamannya langsung hidup di
 * `/umkm/<slug>` karena route-nya dinamis.
 */
export async function POST(request: Request) {
  const hasil = butuhAdmin();
  if ('tolak' in hasil) return hasil.tolak;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak terbaca.' }, { status: 400 });
  }

  const nama = String(body.nama || '').trim();
  const namaPengguna = String(body.namaPengguna || '').trim();
  if (!nama) return NextResponse.json({ error: 'Nama usaha wajib diisi.' }, { status: 400 });
  if (!namaPengguna) {
    return NextResponse.json({ error: 'Nama pengguna wajib diisi.' }, { status: 400 });
  }

  const bio = String(body.bio || '');
  const foto = String(body.foto || '');
  const kontakWa = String(body.kontakWa || '');
  const alamat = String(body.alamat || '');
  const tema = bacaTema(body.tema);
  const tataLetak = bacaTataLetak(body.tataLetak);

  // Halamannya disusun DI SINI, saat pendaftaran, bukan nanti saat pemiliknya
  // membukanya. Kalau blok harus diisi manual, 20 UMKM berarti 20 halaman kosong
  // — lebih buruk daripada profil seragam yang digantikannya. Dengan ini halaman
  // sudah layak dibagikan sebelum pemiliknya pernah masuk sekali pun.
  const halaman = tulisHalaman(
    halamanBawaan({ nama, bio, foto, alamat, kontakWa }, tataLetak)
  );

  const umkm = await buatUmkm({
    nama,
    slug: String(body.slug || nama),
    bio,
    foto,
    kontakWa,
    alamat,
    tema,
    tataLetak,
    halaman,
  }).catch((err) => {
    console.error('Gagal membuat UMKM:', err);
    return null;
  });

  if (!umkm) {
    return NextResponse.json({ error: 'Usaha tidak dapat disimpan.' }, { status: 500 });
  }

  const sandi = sandiAcak();
  try {
    await buatAkun({
      namaPengguna,
      hashSandi: await hashSandi(sandi),
      peran: 'umkm',
      umkmId: umkm.id,
    });
  } catch (err) {
    // Google Sheets tidak punya transaksi. Kalau akunnya gagal dibuat, UMKM yang
    // terlanjur dibuat dinonaktifkan supaya tidak tertinggal sebagai halaman
    // tanpa pemilik yang tetap tayang di situs publik.
    await perbaruiUmkm({ id: umkm.id, status: 'nonaktif' }).catch(() => {});
    const pesan = err instanceof Error ? err.message : 'Akun tidak dapat dibuat.';
    return NextResponse.json({ error: pesan }, { status: 400 });
  }

  // Usaha baru langsung tayang: cache daftar UMKM dibuang di sini, bukan
  // menunggu 60 detik. Halaman yang baru didaftarkan lalu tidak muncul terbaca
  // sebagai pendaftaran yang gagal.
  revalidateTag(TAG_UMKM);

  // Kata sandi dikembalikan SEKALI di sini dan tidak disimpan di mana pun.
  return NextResponse.json({
    ok: true,
    umkm,
    namaPengguna,
    sandi,
  });
}

/** Ubah profil UMKM. Peran umkm hanya boleh miliknya sendiri. */
export async function PATCH(request: Request) {
  const hasil = butuhSesi();
  if ('tolak' in hasil) return hasil.tolak;
  const { sesi } = hasil;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak terbaca.' }, { status: 400 });
  }

  // Peran umkm SELALU menulis ke usahanya sendiri, apa pun `id` yang dikirim.
  // Inilah penjagaannya: kalau `body.id` ikut dipakai untuk peran umkm, siapa
  // pun tinggal menuliskan id orang lain di badan permintaan.
  const id = sesi.peran === 'admin' ? String(body.id || '') : sesi.umkmId;
  if (!id) return NextResponse.json({ error: 'UMKM tidak disebut.' }, { status: 400 });

  // Daftar putih, bukan menyalin seluruh badan permintaan. Field yang tidak
  // disebut di sini tidak akan pernah sampai ke sheet — termasuk `slug`, yang
  // memang tidak boleh berubah, dan field karangan yang tidak dikenal.
  const isi: Record<string, unknown> = { id };
  for (const k of ['nama', 'bio', 'foto', 'kontakWa', 'alamat'] as const) {
    if (body[k] !== undefined) isi[k] = String(body[k]);
  }
  if (body.tema !== undefined) isi.tema = bacaTema(body.tema);
  if (body.tataLetak !== undefined) isi.tataLetak = bacaTataLetak(body.tataLetak);

  // Susunan halaman melewati pembaca yang sama dengan jalur baca, jadi apa pun
  // yang diterima di sini sudah pasti berbentuk `Blok[]` yang sah saat disimpan.
  // Field asing dari formulir tidak ikut menumpuk di sel yang punya batas.
  if (body.halaman !== undefined) {
    isi.halaman = tulisHalaman(
      Array.isArray(body.halaman) ? (body.halaman as Parameters<typeof tulisHalaman>[0]) : []
    );
  }

  // Hanya super admin boleh mengubah status. Tanpa penjagaan ini, pemilik UMKM
  // bisa menonaktifkan usahanya sendiri lalu tidak punya cara mengaktifkannya
  // kembali, karena halaman panelnya ikut kehilangan isi.
  if (sesi.peran === 'admin' && body.status !== undefined) {
    isi.status = body.status === 'nonaktif' ? 'nonaktif' : 'aktif';
  }

  try {
    const data = await perbaruiUmkm(isi);
    // Cache halaman publik dibuang SETELAH backend menjawab berhasil, bukan
    // sebelum. Membuangnya lebih dulu berarti kegagalan penyimpanan tetap
    // memaksa pengunjung berikutnya menanggung 4 detik ke Apps Script demi data
    // yang ternyata tidak berubah sama sekali.
    revalidateTag(TAG_UMKM);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('Gagal memperbarui UMKM:', err);
    const pesan = err instanceof Error ? err.message : 'Perubahan tidak dapat disimpan.';
    return NextResponse.json({ error: pesan }, { status: 500 });
  }
}
