import assert from 'node:assert/strict';
import { dataProdukDariPermintaan, produkDenganProfil } from '../lib/produk.ts';
import type { Produk, Umkm } from '../lib/types.ts';

const produkLama: Produk = {
  id: 'p1',
  namaProduk: 'Keripik Pisang',
  kategori: 'Makanan',
  harga: 15000,
  stok: 'Tersedia',
  deskripsi: '',
  foto: '',
  kontakWa: '628111111111',
  namaUmkm: 'Nama Lama',
  umkmId: 'u1',
  alamat: 'Alamat lama',
  status: 'Aktif',
};

const profil: Umkm = {
  id: 'u1',
  slug: 'dapur-bu-nia',
  nama: 'Dapur Bu Nia',
  bio: '',
  foto: '',
  kontakWa: '628222222222',
  alamat: 'Kp. Bojong RT 01 RW 02',
  status: 'aktif',
  dibuat: '',
  halaman: [],
  tema: 'zaitun',
  tataLetak: 'toko',
};

const [terhubung] = produkDenganProfil([produkLama], [profil]);
assert.equal(terhubung.namaUmkm, profil.nama, 'nama harus mengikuti Profil usaha');
assert.equal(terhubung.kontakWa, profil.kontakWa, 'WhatsApp harus mengikuti Profil usaha');
assert.equal(terhubung.alamat, profil.alamat, 'alamat harus mengikuti Profil usaha');
assert.equal(produkLama.namaUmkm, 'Nama Lama', 'fungsi tidak boleh mengubah data asal');

const produkLawas = { ...produkLama, id: 'p2', umkmId: '' };
assert.strictEqual(
  produkDenganProfil([produkLawas], [profil])[0],
  produkLawas,
  'produk lawas tanpa umkmId harus mempertahankan data cadangannya'
);

const produkYatim = { ...produkLama, id: 'p3', umkmId: 'tidak-ditemukan' };
assert.strictEqual(
  produkDenganProfil([produkYatim], [profil])[0],
  produkYatim,
  'produk dengan profil yang hilang tidak boleh kehilangan data cadangannya'
);

assert.deepEqual(
  dataProdukDariPermintaan({
    namaProduk: '  Keripik Pisang  ',
    harga: 15000,
    stok: 'Tersedia',
    kontakWa: '628999999999',
    namaUmkm: 'Nama karangan',
    alamat: 'Alamat karangan',
    umkmId: 'usaha-lain',
    fieldKarangan: 'tidak boleh lolos',
  }),
  {
    namaProduk: 'Keripik Pisang',
    harga: 15000,
    stok: 'Tersedia',
  },
  'jalur produk hanya boleh menerima field yang dikelola formulir produk'
);

console.log('OK - semua pemeriksaan sumber data produk lolos.');
