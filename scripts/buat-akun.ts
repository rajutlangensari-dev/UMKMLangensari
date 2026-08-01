/**
 * Membuat akun portal dari baris perintah.
 *
 *   npm run akun -- <namaPengguna> <admin|umkm> [slugUmkm]
 *
 * Contoh:
 *   npm run akun -- admin admin
 *   npm run akun -- rajut umkm rajut-langensari
 *
 * KENAPA INI ADA, BUKAN MENU DI GOOGLE SHEET:
 * Apps Script tidak punya scrypt, jadi hash kata sandi hanya bisa dihitung di
 * Node. Menu di sheet mustahil membuat akun tanpa memindahkan hashing ke sana,
 * dan hashing buatan sendiri di Apps Script justru yang harus dihindari.
 *
 * Skrip ini tetap berguna setelah panel jadi: kalau semua akun admin terkunci,
 * ini satu-satunya jalan masuk kembali tanpa menyentuh basis data.
 *
 * Kata sandi dicetak SEKALI ke layar dan tidak disimpan di mana pun. Salin,
 * serahkan ke pemiliknya, lalu bersihkan layar terminal.
 */

import fs from 'node:fs';
import path from 'node:path';
import { hashSandi, sandiAcak } from '../lib/auth.ts';
import type { Peran, Umkm, Akun } from '../lib/types.ts';

function muatEnv(): Record<string, string> {
  const berkas = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(berkas)) throw new Error('.env.local tidak ditemukan.');
  const hasil: Record<string, string> = {};
  for (const baris of fs.readFileSync(berkas, 'utf8').split('\n')) {
    const t = baris.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) hasil[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return hasil;
}

const env = muatEnv();
const URL_BACKEND = env.NEXT_PUBLIC_APPS_SCRIPT_URL;
const RAHASIA = env.APPS_SCRIPT_SECRET;

async function panggil<T>(action: string, data?: Record<string, unknown>): Promise<T> {
  const res = await fetch(URL_BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, rahasia: RAHASIA, data }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Permintaan gagal.');
  return json.data as T;
}

async function jalan() {
  if (!URL_BACKEND) throw new Error('NEXT_PUBLIC_APPS_SCRIPT_URL kosong di .env.local.');
  if (!RAHASIA) throw new Error('APPS_SCRIPT_SECRET kosong di .env.local.');

  const [namaPengguna, peranArg, slugUmkm] = process.argv.slice(2);
  if (!namaPengguna || !peranArg) {
    console.error('Pemakaian: npm run akun -- <namaPengguna> <admin|umkm> [slugUmkm]');
    process.exit(1);
  }
  if (peranArg !== 'admin' && peranArg !== 'umkm') {
    console.error('Peran harus "admin" atau "umkm".');
    process.exit(1);
  }
  const peran = peranArg as Peran;

  let umkmId = '';
  if (peran === 'umkm') {
    if (!slugUmkm) {
      console.error('Akun peran "umkm" wajib menyebut slug UMKM-nya.');
      process.exit(1);
    }
    const daftar = await panggil<Umkm[]>('portal.daftarUmkm', {});
    const target = daftar.find((u) => u.slug === slugUmkm);
    if (!target) {
      console.error(`UMKM dengan slug "${slugUmkm}" tidak ada. Yang tersedia:`);
      daftar.forEach((u) => console.error(`  ${u.slug}`));
      process.exit(1);
    }
    umkmId = target.id;
  }

  const sandi = sandiAcak();
  const akun = await panggil<Akun>('portal.buatAkun', {
    namaPengguna,
    hashSandi: await hashSandi(sandi),
    peran,
    umkmId,
  });

  console.log('');
  console.log('  Akun dibuat.');
  console.log('  ---------------------------------------------');
  console.log(`  Nama pengguna : ${akun.namaPengguna}`);
  console.log(`  Peran         : ${akun.peran}`);
  if (umkmId) console.log(`  UMKM          : ${slugUmkm}`);
  console.log(`  Kata sandi    : ${sandi}`);
  console.log('  ---------------------------------------------');
  console.log('  Kata sandi ini hanya ditampilkan sekali dan tidak disimpan.');
  console.log('  Salin sekarang, lalu bersihkan layar terminal.');
  console.log('');
}

jalan().catch((err) => {
  console.error('GAGAL:', err.message);
  process.exit(1);
});
