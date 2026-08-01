/**
 * Uji mandiri lapisan autentikasi.
 *
 * Jalankan:  npm run uji
 *
 * Bukan kerangka uji, cuma assert. Yang diperiksa hanya hal-hal yang kalau
 * rusak diam-diam akan membuka portal untuk orang yang tidak berhak — bukan
 * setiap fungsi.
 */

import assert from 'node:assert/strict';
import {
  hashSandi,
  verifikasiSandi,
  buatToken,
  bacaToken,
  sandiAcak,
  sedangTerkunci,
  MAKS_GAGAL,
} from '../lib/auth.ts';
import { tulisTampilan, bacaTampilan, inisial } from '../lib/tampilan.ts';
import type { Sesi } from '../lib/types.ts';

process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || 'rahasia-uji-yang-panjangnya-lebih-dari-32-karakter';

const SESI: Sesi = { akunId: 'a1', namaPengguna: 'rajut', peran: 'umkm', umkmId: 'u1' };

async function jalan() {
  // --- Kata sandi ---
  const hash = await hashSandi('kata-sandi-benar');
  assert.ok(hash.startsWith('scrypt$'), 'hash harus menyebut algoritmanya');
  assert.ok(!hash.includes('kata-sandi-benar'), 'hash tidak boleh memuat sandi aslinya');
  assert.equal(await verifikasiSandi('kata-sandi-benar', hash), true, 'sandi benar harus lolos');
  assert.equal(await verifikasiSandi('kata-sandi-salah', hash), false, 'sandi salah harus ditolak');

  // Garam acak: sandi sama, hash harus beda. Kalau sama, satu tabel pelangi
  // membuka semua akun sekaligus.
  const hash2 = await hashSandi('kata-sandi-benar');
  assert.notEqual(hash, hash2, 'dua hash dari sandi sama harus berbeda');

  // Masukan rusak tidak boleh melempar, harus menolak dengan tenang.
  for (const rusak of ['', 'bukan-format', 'scrypt$xx', 'scrypt$aa$bb', 'a$b$c']) {
    assert.equal(await verifikasiSandi('apa pun', rusak), false, `hash rusak ditolak: ${rusak}`);
  }

  // --- Token sesi ---
  const token = buatToken(SESI);
  assert.deepEqual(bacaToken(token), SESI, 'token utuh harus terbaca kembali');
  assert.equal(bacaToken(undefined), null, 'tanpa token harus null');
  assert.equal(bacaToken('sampah'), null, 'token ngawur harus null');

  // Ini uji yang paling penting: mengubah isi token tanpa tanda tangan yang sah
  // harus gagal. Kalau lolos, siapa pun bisa mengaku sebagai super admin.
  const [muatan, tanda] = token.split('.');
  const palsu = { ...SESI, peran: 'admin' };
  const muatanPalsu = Buffer.from(
    JSON.stringify({ ...palsu, exp: Math.floor(Date.now() / 1000) + 999 })
  ).toString('base64url');
  assert.equal(bacaToken(`${muatanPalsu}.${tanda}`), null, 'naik peran tanpa tanda tangan harus gagal');
  assert.equal(bacaToken(`${muatan}.${tanda}x`), null, 'tanda tangan diubah harus gagal');
  assert.equal(bacaToken(`${muatan}.`), null, 'tanda tangan kosong harus gagal');

  // Token kedaluwarsa ditolak.
  const lampau = Buffer.from(
    JSON.stringify({ ...SESI, exp: Math.floor(Date.now() / 1000) - 10 })
  ).toString('base64url');
  const { createHmac } = await import('node:crypto');
  const tandaLampau = createHmac('sha256', Buffer.from(process.env.SESSION_SECRET!, 'utf8'))
    .update(lampau)
    .digest('base64url');
  assert.equal(bacaToken(`${lampau}.${tandaLampau}`), null, 'token kedaluwarsa harus ditolak');

  // --- Penguncian ---
  assert.equal(sedangTerkunci(0, ''), false, 'nol kegagalan tidak terkunci');
  assert.equal(sedangTerkunci(MAKS_GAGAL - 1, new Date().toISOString()), false, 'di bawah batas belum terkunci');
  assert.equal(sedangTerkunci(MAKS_GAGAL, new Date().toISOString()), true, 'batas tercapai harus terkunci');
  const lama = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  assert.equal(sedangTerkunci(MAKS_GAGAL, lama), false, 'kunci harus lepas setelah jeda lewat');

  // --- Sandi acak ---
  assert.equal(sandiAcak().length, 12, 'sandi awal 12 karakter');
  assert.notEqual(sandiAcak(), sandiAcak(), 'sandi awal tidak boleh berulang');
  assert.ok(!/[il1o0]/.test(sandiAcak()), 'sandi awal tanpa huruf yang rancu saat dibacakan');

  // --- Cookie tampilan ---
  //
  // Isinya bisa diketik tangan siapa pun lewat konsol peramban. Yang diperiksa
  // di sini bukan "apakah ia benar" melainkan "apakah ia BISA menjatuhkan
  // header" — karena header itu muncul di setiap halaman publik, dan satu galat
  // yang dilempar di sana mematikan seluruh situs bagi pengunjung yang cookie-nya
  // kebetulan rusak.
  // Pulang-perginya diuji LEWAT KAWAT, bukan fungsi ke fungsi langsung.
  //
  // Versi lama menguji `bacaTampilan(tulisTampilan(x))` dan lolos hijau selama
  // berminggu-minggu sementara loginnya rusak di peramban. Sebabnya ada satu
  // langkah di tengah yang tidak ikut diuji: `NextResponse.cookies.set()`
  // meng-encode nilainya sekali lagi sebelum dikirim, dan `document.cookie`
  // memulangkan hasil encode itu apa adanya. Dua fungsi yang cocok satu sama
  // lain tetap bisa gagal kalau yang mengantar di antaranya ikut mengubah isi.
  const lewatKawat = (t: { nama: string; peran: 'admin' | 'umkm' }) =>
    bacaTampilan(encodeURIComponent(tulisTampilan(t)));

  assert.deepEqual(
    lewatKawat({ nama: 'rajut', peran: 'umkm' }),
    { nama: 'rajut', peran: 'umkm' },
    'cookie tampilan pulang-pergi lewat encode Next'
  );
  assert.deepEqual(
    lewatKawat({ nama: 'Bu Îmas & Ãnak', peran: 'admin' }),
    { nama: 'Bu Îmas & Ãnak', peran: 'admin' },
    'nama ber-tanda baca dan huruf beraksen harus utuh'
  );
  assert.ok(
    !tulisTampilan({ nama: 'rajut', peran: 'umkm' }).includes('%'),
    'tulisTampilan tidak boleh meng-encode sendiri — Next yang melakukannya'
  );

  for (const sampah of [
    undefined,
    null,
    '',
    'bukan-json',
    '%%%',
    encodeURIComponent('[]'),
    encodeURIComponent('null'),
    encodeURIComponent('{"n":"x"}'), // peran hilang
    encodeURIComponent('{"p":"admin"}'), // nama hilang
    encodeURIComponent('{"n":"x","p":"dewa"}'), // peran karangan
    encodeURIComponent('{"n":123,"p":"admin"}'),
  ]) {
    assert.equal(bacaTampilan(sampah), null, `cookie tampilan rusak harus null: ${sampah}`);
  }

  // Peran yang tidak dikenal TIDAK BOLEH lolos jadi peran apa pun. Kalau lolos,
  // menu akun akan menampilkan butir milik peran lain — bukan lubang keamanan
  // (halamannya tetap menolak), tapi tetap menjanjikan sesuatu yang tidak ada.
  assert.equal(bacaTampilan(encodeURIComponent('{"n":"x","p":"root"}')), null);

  assert.equal(inisial('rajut'), 'R', 'avatar memakai huruf awal kapital');
  assert.equal(inisial('   '), '?', 'nama kosong tetap menghasilkan sesuatu');

  console.log('OK — semua pemeriksaan auth lolos.');
}

jalan().catch((err) => {
  console.error('GAGAL:', err.message);
  process.exit(1);
});
