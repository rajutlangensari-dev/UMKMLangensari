import { NextResponse } from 'next/server';
import { NAMA_COOKIE, opsiCookie } from '@/lib/auth';
import { NAMA_COOKIE_TAMPILAN, opsiCookieTampilan } from '@/lib/tampilan';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // maxAge 0 menghapus cookie. Sisa opsinya harus sama persis dengan saat
  // dipasang, kalau tidak peramban menganggapnya cookie lain dan yang lama tetap ada.
  res.cookies.set({ ...opsiCookie, name: NAMA_COOKIE, value: '', maxAge: 0 });
  // Cookie tampilan ikut dihapus. Kalau tertinggal, header masih menampilkan
  // nama orang yang barusan keluar sampai cookie itu kedaluwarsa sendiri —
  // di komputer bersama, itu terbaca seperti keluar yang gagal.
  res.cookies.set({
    ...opsiCookieTampilan,
    name: NAMA_COOKIE_TAMPILAN,
    value: '',
    maxAge: 0,
  });
  return res;
}
