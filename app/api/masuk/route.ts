import { NextResponse } from 'next/server';
import { ambilAkunUntukMasuk, catatMasuk } from '@/lib/backend';
import {
  buatToken,
  hashSandi,
  opsiCookie,
  sedangTerkunci,
  verifikasiSandi,
} from '@/lib/auth';
import { opsiCookieTampilan, tulisTampilan } from '@/lib/tampilan';

// Satu pesan untuk semua kegagalan. Membedakan "nama pengguna tidak ada" dari
// "kata sandi salah" berarti memberi tahu penebak bahwa nama itu benar, dan
// pemilik UMKM di desa memakai nama pengguna yang mudah ditebak.
const GAGAL = 'Nama pengguna atau kata sandi salah.';

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
    const akun = await ambilAkunUntukMasuk(namaPengguna);

    // Nama pengguna tidak ada: tetap jalankan scrypt sekali supaya lamanya
    // jawaban tidak membocorkan nama mana yang terdaftar.
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
