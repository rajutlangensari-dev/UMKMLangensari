import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { butuhAdmin, butuhSesi } from '@/lib/otorisasi';
import {
  ambilAkunSemua,
  ambilAkunUntukMasuk,
  ambilUmkmSemua,
  buatAkun,
  perbaruiAkun,
} from '@/lib/backend';
import { hashSandi, opsiCookie, sandiAcak, SANDI_MIN, verifikasiSandi } from '@/lib/auth';
import { opsiCookieTampilan } from '@/lib/tampilan';
import { TAG_AKUN } from '@/lib/publik';

/**
 * Buat akun baru untuk usaha yang sudah terdaftar, atau super admin tambahan.
 *
 * Sebelumnya satu-satunya jalan adalah `npm run akun` di terminal, dan itu
 * tertulis di antarmuka — menyuruh perangkat desa membuka terminal. Jalur
 * terminal tetap ada untuk keadaan darurat (akun pertama, atau saat panel tidak
 * bisa dibuka sama sekali), tapi tidak lagi disebut di UI.
 *
 * Memakai `portal.buatAkun` yang SUDAH ada dan sudah ter-deploy — dipakai juga
 * oleh `POST /api/umkm`. Tidak ada aksi Apps Script baru untuk ini.
 */
export async function POST(request: Request) {
  const admin = butuhAdmin();
  if ('tolak' in admin) return admin.tolak;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak terbaca.' }, { status: 400 });
  }

  const namaPengguna = String(body.namaPengguna || '').trim().toLowerCase();
  const peran = body.peran === 'admin' ? 'admin' : 'umkm';
  const umkmId = peran === 'umkm' ? String(body.umkmId || '') : '';

  if (!namaPengguna) {
    return NextResponse.json({ error: 'Nama pengguna wajib diisi.' }, { status: 400 });
  }
  if (!/^[a-z0-9._-]{3,}$/.test(namaPengguna)) {
    return NextResponse.json(
      { error: 'Nama pengguna minimal 3 karakter, hanya huruf, angka, titik, dan strip.' },
      { status: 400 }
    );
  }

  // Diperiksa lebih dulu supaya pesannya bisa dimengerti. Backend juga menolak
  // nama ganda; yang di sini menerjemahkannya jadi kalimat, bukan galat mentah.
  const semuaAkun = await ambilAkunSemua();
  if (semuaAkun.some((a) => a.namaPengguna.toLowerCase() === namaPengguna)) {
    return NextResponse.json(
      { error: `Nama pengguna "${namaPengguna}" sudah dipakai. Pilih yang lain.` },
      { status: 400 }
    );
  }

  if (peran === 'umkm') {
    if (!umkmId) {
      return NextResponse.json({ error: 'Pilih dulu usaha pemilik akun ini.' }, { status: 400 });
    }
    const umkm = await ambilUmkmSemua();
    if (!umkm.some((u) => u.id === umkmId)) {
      return NextResponse.json({ error: 'Usaha tidak ditemukan.' }, { status: 404 });
    }
  }

  const sandi = sandiAcak();
  try {
    await buatAkun({ namaPengguna, hashSandi: await hashSandi(sandi), peran, umkmId });
  } catch (err) {
    const pesan = err instanceof Error ? err.message : 'Akun tidak dapat dibuat.';
    return NextResponse.json({ error: pesan }, { status: 400 });
  }

  // Daftar pencocok "masuk pakai nama usaha" dibuang di sini, bukan dibiarkan
  // basi 60 detik. Tanpa ini, pemilik yang baru dibuatkan akun lalu langsung
  // disuruh mencoba masuk di depan Korwil akan ditolak kalau ia mengetik nama
  // usahanya — dan yang menyaksikan akan menyimpulkan akunnya gagal dibuat.
  revalidateTag(TAG_AKUN);

  // Kata sandi dikembalikan SEKALI di sini dan tidak disimpan di mana pun.
  return NextResponse.json({ ok: true, namaPengguna, sandi });
}

/**
 * PATCH menangani tiga hal yang semuanya menulis ke baris akun:
 *
 *   { aksi: 'gantiSandi', sandiLama, sandiBaru }   siapa pun, untuk dirinya sendiri
 *   { aksi: 'setelUlangSandi', id }                super admin, untuk akun lain
 *   { aksi: 'setStatus', id, status }              super admin
 *
 * Digabung dalam satu berkas karena ketiganya berbagi pemeriksaan yang sama dan
 * memisahkannya jadi tiga route hanya menyalin kode penjagaan tiga kali.
 */
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

  const aksi = String(body.aksi || '');

  // --- Ganti kata sandi sendiri ---
  if (aksi === 'gantiSandi') {
    const sandiLama = String(body.sandiLama || '');
    const sandiBaru = String(body.sandiBaru || '');
    if (sandiBaru.length < SANDI_MIN) {
      return NextResponse.json(
        { error: `Kata sandi baru minimal ${SANDI_MIN} karakter.` },
        { status: 400 }
      );
    }
    if (sandiBaru === sandiLama) {
      return NextResponse.json({ error: 'Kata sandi baru sama dengan yang lama.' }, { status: 400 });
    }

    const akun = await ambilAkunUntukMasuk(sesi.namaPengguna);
    if (!akun) return NextResponse.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });

    // Kata sandi lama diverifikasi walaupun sesinya sah. Cookie yang dicuri atau
    // layar yang ditinggal terbuka tidak boleh cukup untuk mengunci pemiliknya
    // keluar dari akunnya sendiri.
    if (!(await verifikasiSandi(sandiLama, akun.hashSandi))) {
      return NextResponse.json({ error: 'Kata sandi lama salah.' }, { status: 401 });
    }

    await perbaruiAkun({ id: akun.id, hashSandi: await hashSandi(sandiBaru) });
    return NextResponse.json({ ok: true });
  }

  // --- Ganti nama pengguna sendiri ---
  //
  // Untuk diri sendiri saja, bukan akun orang lain. Nama pengguna bawaan
  // (`umkm-langensari-17`) sulit diketik ibu-ibu pemilik warung; membiarkan
  // mereka menggantinya sendiri lebih murah daripada Korwil jadi tempat
  // bertanya tiap kali ada yang lupa.
  if (aksi === 'gantiNamaPengguna') {
    const baru = String(body.namaPengguna || '').trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,}$/.test(baru)) {
      return NextResponse.json(
        { error: 'Minimal 3 karakter, hanya huruf kecil, angka, titik, dan strip.' },
        { status: 400 }
      );
    }
    if (baru === sesi.namaPengguna.toLowerCase()) {
      return NextResponse.json({ error: 'Nama pengguna baru sama dengan yang digunakan saat ini.' }, { status: 400 });
    }

    // Kata sandi diminta walaupun sesinya sah, sama seperti ganti sandi.
    // Layar panel yang ditinggal terbuka tidak boleh cukup untuk mengganti
    // pengenal masuk pemiliknya.
    const akun = await ambilAkunUntukMasuk(sesi.namaPengguna);
    if (!akun) return NextResponse.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });
    if (!(await verifikasiSandi(String(body.sandi || ''), akun.hashSandi))) {
      return NextResponse.json({ error: 'Kata sandi salah.' }, { status: 401 });
    }

    try {
      await perbaruiAkun({ id: akun.id, namaPengguna: baru });
    } catch (err) {
      const pesan = err instanceof Error ? err.message : 'Tidak dapat disimpan.';
      return NextResponse.json({ error: pesan }, { status: 400 });
    }
    revalidateTag(TAG_AKUN);

    // Sesi lama memuat nama pengguna yang sudah tidak ada, dan jalur ganti
    // sandi mencari akun BERDASARKAN NAMA itu — dibiarkan hidup, orangnya akan
    // ditolak "Akun tidak ditemukan" di panelnya sendiri. Jadi cookie-nya
    // dibuang di sini dan dia masuk lagi dengan nama barunya.
    const res = NextResponse.json({ ok: true, namaPengguna: baru });
    res.cookies.set({ ...opsiCookie, value: '', maxAge: 0 });
    res.cookies.set({ ...opsiCookieTampilan, value: '', maxAge: 0 });
    return res;
  }

  // --- Sisanya khusus super admin ---
  const admin = butuhAdmin();
  if ('tolak' in admin) return admin.tolak;

  const id = String(body.id || '');
  if (!id) return NextResponse.json({ error: 'Akun tidak disebut.' }, { status: 400 });

  if (aksi === 'setelUlangSandi') {
    const sandi = sandiAcak();
    await perbaruiAkun({ id, hashSandi: await hashSandi(sandi) });
    // Ditampilkan sekali ke super admin untuk diserahkan, tidak disimpan.
    return NextResponse.json({ ok: true, sandi });
  }

  if (aksi === 'setStatus') {
    const status = body.status === 'nonaktif' ? 'nonaktif' : 'aktif';

    // Menonaktifkan diri sendiri berarti langsung kehilangan panel, dan kalau
    // dia satu-satunya admin, portal tidak punya jalan masuk lagi selain editor
    // Apps Script. Penjagaan "admin terakhir" ada juga di Portal.gs; yang ini
    // memberi pesan yang bisa dimengerti sebelum sampai ke sana.
    if (id === sesi.akunId && status === 'nonaktif') {
      return NextResponse.json(
        { error: 'Tidak bisa menonaktifkan akun sendiri.' },
        { status: 400 }
      );
    }

    try {
      await perbaruiAkun({ id, status });
      // Status ikut menentukan pencocokan nama usaha: hanya akun aktif yang
      // boleh dipakai masuk lewat nama usahanya.
      revalidateTag(TAG_AKUN);
      return NextResponse.json({ ok: true });
    } catch (err) {
      const pesan = err instanceof Error ? err.message : 'Tidak dapat disimpan.';
      return NextResponse.json({ error: pesan }, { status: 400 });
    }
  }

  return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
}

/** Daftar akun untuk super admin. Hash sandi tidak ikut, dibuang di Portal.gs. */
export async function GET() {
  const admin = butuhAdmin();
  if ('tolak' in admin) return admin.tolak;
  return NextResponse.json({ ok: true, data: await ambilAkunSemua() });
}
