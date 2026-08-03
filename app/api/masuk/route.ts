import { NextResponse } from 'next/server';
import {
  ambilAkunSemua,
  ambilAkunUntukMasuk,
  ambilUmkmSemua,
  catatMasuk,
} from '@/lib/backend';
import {
  buatToken,
  hashSandi,
  opsiCookie,
  sedangTerkunci,
  verifikasiSandi,
} from '@/lib/auth';
import { opsiCookieTampilan, tulisTampilan } from '@/lib/tampilan';
import { namaPenggunaDariNamaUsaha } from '@/lib/pengenal-masuk';

// Satu pesan untuk semua kegagalan. Membedakan "nama usaha tidak ditemukan",
// "nama pengguna tidak ada", dan "kata sandi salah" akan membocorkan pengenal
// akun mana yang terdaftar.
const GAGAL = 'Nama usaha, nama pengguna, atau kata sandi tidak sesuai.';

export async function POST(request: Request) {
  let namaPengguna = '';
  let sandi = '';
  try {
    const body = await request.json();
    namaPengguna = String(body.namaPengguna || '').trim();
    sandi = String(body.sandi || '');
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak terbaca.' }, { status: 400 });
  }

  if (!namaPengguna || !sandi) {
    return NextResponse.json({ error: GAGAL }, { status: 401 });
  }

  try {
    // Nama pengguna tetap jalur utama dan tercepat. Jika tidak ditemukan, masukan
    // dicoba sebagai nama usaha. Pemetaan ini memakai aksi backend yang sudah
    // ada; Apps Script dan susunan sheet tidak perlu diubah.
    let akun = await ambilAkunUntukMasuk(namaPengguna);
    if (!akun) {
      const [semuaAkun, semuaUmkm] = await Promise.all([
        ambilAkunSemua(),
        ambilUmkmSemua(),
      ]);
      const namaPenggunaAlias = namaPenggunaDariNamaUsaha(
        namaPengguna,
        semuaAkun,
        semuaUmkm
      );
      if (namaPenggunaAlias) akun = await ambilAkunUntukMasuk(namaPenggunaAlias);
    }

    // Pengenal tidak ada: tetap jalankan scrypt sekali supaya jawaban gagal
    // tidak menjadi jauh lebih cepat daripada kata sandi yang perlu diperiksa.
    if (!akun) {
      await hashSandi(sandi);
      return NextResponse.json({ error: GAGAL }, { status: 401 });
    }

    if (akun.status === 'nonaktif') {
      return NextResponse.json({ error: GAGAL }, { status: 401 });
    }

    if (sedangTerkunci(akun.gagal, akun.gagalTerakhir)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' },
        { status: 429 }
      );
    }

    const cocok = await verifikasiSandi(sandi, akun.hashSandi);
    await catatMasuk(akun.id, cocok);
    if (!cocok) {
      return NextResponse.json({ error: GAGAL }, { status: 401 });
    }

    const res = NextResponse.json({
      ok: true,
      peran: akun.peran,
      namaPengguna: akun.namaPengguna,
    });
    res.cookies.set({
      ...opsiCookie,
      value: buatToken({
        akunId: akun.id,
        namaPengguna: akun.namaPengguna,
        peran: akun.peran,
        umkmId: akun.umkmId,
      }),
    });

    // Cookie kedua, khusus tampilan header. Sengaja TIDAK menyertakan nama atau
    // foto usahanya: keduanya butuh satu pembacaan sheet lagi, dan di backend
    // yang sekali waktu menjawab dalam hitungan detik itu berarti login terasa
    // menggantung demi sebuah avatar. Huruf awal nama pengguna sudah cukup.
    res.cookies.set({
      ...opsiCookieTampilan,
      value: tulisTampilan({ nama: akun.namaPengguna, peran: akun.peran }),
    });
    return res;
  } catch (err) {
    // Galat backend tidak diteruskan apa adanya: isinya bisa memuat detail
    // konfigurasi Apps Script. Yang lengkap masuk log server.
    console.error('Login gagal:', err);
    return NextResponse.json({ error: 'Server sedang bermasalah. Coba lagi.' }, { status: 500 });
  }
}
