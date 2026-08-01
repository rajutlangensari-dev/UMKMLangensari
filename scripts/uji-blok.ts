/**
 * Uji lapisan blok halaman. `npm run uji:blok`
 *
 * Yang diperiksa cuma satu hal, tapi hal itu yang paling penting: data rusak
 * dari sheet TIDAK BOLEH menjatuhkan halaman publik. Sel itu bisa disunting
 * tangan oleh siapa pun yang punya akses spreadsheet, jadi ia diperlakukan
 * seperti masukan pengguna mana pun.
 */

import assert from 'node:assert/strict';
import {
  bacaHalaman,
  tulisHalaman,
  bacaTema,
  bacaTataLetak,
  halamanBawaan,
  halamanAtauBawaan,
  keParagraf,
  blokKosong,
  idBlok,
  jangkarHalaman,
  adaIsi,
  sorotProduk,
  fotoDalamBlok,
  SOROT_KATALOG,
  MAKS_GALERI,
  type Blok,
} from '../lib/blok.ts';

let lulus = 0;
function uji(nama: string, jalan: () => void) {
  try {
    jalan();
    lulus++;
    console.log(`  ok  ${nama}`);
  } catch (err) {
    console.error(`  GAGAL  ${nama}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('\nMasukan rusak tidak boleh menjatuhkan halaman');

uji('JSON rusak jadi array kosong', () => {
  assert.deepEqual(bacaHalaman('{ini bukan json'), []);
  assert.deepEqual(bacaHalaman('[[[['), []);
});

uji('nilai bukan array jadi array kosong', () => {
  assert.deepEqual(bacaHalaman(null), []);
  assert.deepEqual(bacaHalaman(undefined), []);
  assert.deepEqual(bacaHalaman(''), []);
  assert.deepEqual(bacaHalaman('   '), []);
  assert.deepEqual(bacaHalaman(42), []);
  assert.deepEqual(bacaHalaman('{"jenis":"hero"}'), []);
});

uji('jenis tak dikenal dibuang, yang dikenal tetap lolos', () => {
  const hasil = bacaHalaman([
    { jenis: 'belum-ada-di-versi-ini', judul: 'x' },
    { jenis: 'kontak', judul: 'Hubungi' },
  ]);
  assert.equal(hasil.length, 1);
  assert.equal(hasil[0].jenis, 'kontak');
});

uji('anggota array yang bukan objek dilewati', () => {
  const hasil = bacaHalaman([null, 7, 'hero', [], { jenis: 'katalog' }]);
  assert.equal(hasil.length, 1);
  assert.equal(hasil[0].jenis, 'katalog');
});

uji('field hilang diisi nilai kosong, bukan undefined', () => {
  const [b] = bacaHalaman([{ jenis: 'hero' }]);
  assert.equal(b.jenis, 'hero');
  if (b.jenis !== 'hero') throw new Error('tipe salah');
  assert.equal(b.judul, '');
  assert.equal(b.foto, '');
  assert.equal(typeof b.id, 'string');
  assert.ok(b.id.length > 0);
});

uji('field bertipe salah dipaksa ke tipe yang dijanjikan', () => {
  const [b] = bacaHalaman([{ jenis: 'katalog', judul: 123, batas: 'banyak' }]);
  if (b.jenis !== 'katalog') throw new Error('tipe salah');
  assert.equal(b.judul, '123');
  assert.equal(b.batas, 0);
});

uji('butir yang bukan larik jadi larik kosong', () => {
  const [b] = bacaHalaman([{ jenis: 'fakta', butir: 'bukan larik' }]);
  if (b.jenis !== 'fakta') throw new Error('tipe salah');
  assert.deepEqual(b.butir, []);
});

console.log('\nBatas dan pembersihan');

uji('galeri dipotong di batasnya', () => {
  const foto = Array.from({ length: 20 }, (_, i) => ({ url: `u${i}`, keterangan: '' }));
  const [b] = bacaHalaman([{ jenis: 'galeri', foto }]);
  if (b.jenis !== 'galeri') throw new Error('tipe salah');
  assert.equal(b.foto.length, MAKS_GALERI);
});

uji('foto galeri tanpa url dibuang', () => {
  const [b] = bacaHalaman([
    { jenis: 'galeri', foto: [{ url: '', keterangan: 'kosong' }, { url: 'ada', keterangan: '' }] },
  ]);
  if (b.jenis !== 'galeri') throw new Error('tipe salah');
  assert.equal(b.foto.length, 1);
  assert.equal(b.foto[0].url, 'ada');
});

uji('field asing tidak ikut tersimpan', () => {
  const tersimpan = tulisHalaman(
    bacaHalaman([{ jenis: 'kontak', judul: 'Hubungi', jahat: '<script>', catatan: 'x'.repeat(9999) }])
  );
  assert.ok(!tersimpan.includes('jahat'));
  assert.ok(!tersimpan.includes('script'));
  assert.ok(tersimpan.length < 200);
});

uji('id ganda diperbaiki supaya urutan tidak kacau di React', () => {
  const hasil = bacaHalaman([
    { jenis: 'kontak', id: 'sama' },
    { jenis: 'katalog', id: 'sama' },
  ]);
  assert.notEqual(hasil[0].id, hasil[1].id);
});

uji('aktif:false dihormati, tanpa field itu tetap aktif', () => {
  const hasil = bacaHalaman([
    { jenis: 'kontak', aktif: false },
    { jenis: 'katalog' },
  ]);
  assert.equal(hasil[0].aktif, false);
  assert.equal(hasil[1].aktif, true);
});

console.log('\nPulang-pergi tulis-baca');

uji('blok yang ditulis lalu dibaca kembali sama persis', () => {
  const asal: Blok[] = [
    { id: idBlok(), aktif: true, jenis: 'hero', judul: 'Rajut', subJudul: 'sub', foto: 'f', teksTombol: 'Lihat', sasaranTombol: '' },
    { id: idBlok(), aktif: true, jenis: 'fakta', butir: [{ angka: '12', label: 'tahun' }] },
  ];
  assert.deepEqual(bacaHalaman(tulisHalaman(asal)), asal);
});

uji('setiap jenis blok kosong lolos pulang-pergi', () => {
  for (const jenis of ['hero', 'cerita', 'keunggulan', 'fakta', 'galeri', 'katalog', 'kontak'] as const) {
    const b = blokKosong(jenis);
    const [balik] = bacaHalaman(tulisHalaman([b]));
    assert.deepEqual(balik, b, `jenis ${jenis} berubah setelah pulang-pergi`);
  }
});

console.log('\nTema, tata letak, dan susunan bawaan');

uji('tema dan tata letak tak dikenal jatuh ke bawaan', () => {
  assert.equal(bacaTema('warna-karangan'), 'zaitun');
  assert.equal(bacaTema(''), 'zaitun');
  assert.equal(bacaTema(null), 'zaitun');
  assert.equal(bacaTema('TANAH'), 'tanah');
  assert.equal(bacaTataLetak('entah'), 'toko');
  assert.equal(bacaTataLetak('portofolio'), 'portofolio');
});

uji('halaman bawaan tidak membuat blok tanpa bahan', () => {
  const tanpaBio = halamanBawaan(
    { nama: 'Konveksi Bojong', bio: '', foto: '', alamat: '', kontakWa: '' },
    'cerita'
  );
  assert.ok(!tanpaBio.some((b) => b.jenis === 'cerita'), 'blok cerita kosong tidak boleh dibuat');
  assert.ok(tanpaBio.some((b) => b.jenis === 'hero'));
  assert.ok(tanpaBio.some((b) => b.jenis === 'katalog'));
});

uji('halaman bawaan memakai data pendaftaran', () => {
  const [hero] = halamanBawaan(
    { nama: 'Rajut Langensari', bio: 'Menganyam sejak 2012.', foto: 'foto.jpg', alamat: '', kontakWa: '' },
    'toko'
  );
  if (hero.jenis !== 'hero') throw new Error('blok pertama harus hero');
  assert.equal(hero.judul, 'Rajut Langensari');
  assert.equal(hero.subJudul, 'Menganyam sejak 2012.');
});

uji('foto profil TIDAK disalin jadi foto sampul', () => {
  // Keduanya berperan beda: profil itu potret bulat kecil yang sudah ada di
  // header, sampul itu panorama lebar. Menyalinnya menghasilkan potret bulat
  // yang direntangkan 16:7 plus gambar yang sama dua kali di satu layar.
  for (const tata of ['toko', 'portofolio', 'cerita'] as const) {
    const hero = halamanBawaan(
      { nama: 'X', bio: '', foto: 'profil.jpg', alamat: '', kontakWa: '' },
      tata
    ).find((b) => b.jenis === 'hero');
    if (hero?.jenis !== 'hero') throw new Error('tata letak ' + tata + ' tanpa hero');
    assert.equal(hero.foto, '', `tata letak ${tata} menyalin foto profil ke sampul`);
  }
});

uji('tata letak berbeda menghasilkan susunan berbeda', () => {
  const sumber = { nama: 'X', bio: 'ada cerita', foto: '', alamat: '', kontakWa: '' };
  const toko = halamanBawaan(sumber, 'toko').map((b) => b.jenis);
  const cerita = halamanBawaan(sumber, 'cerita').map((b) => b.jenis);
  assert.notDeepEqual(toko, cerita);
  assert.equal(toko[1], 'katalog', 'tata letak toko menaruh katalog di depan');
  assert.equal(cerita[1], 'cerita', 'tata letak cerita menaruh narasi di depan');
});

uji('halaman kosong dan semua-nonaktif jatuh ke susunan bawaan', () => {
  const sumber = { nama: 'X', bio: '', foto: '', alamat: '', kontakWa: '' };
  assert.ok(halamanAtauBawaan([], sumber, 'toko').length > 0);
  const semuaMati = bacaHalaman([{ jenis: 'kontak', aktif: false }]);
  assert.ok(halamanAtauBawaan(semuaMati, sumber, 'toko').length > 0);
});

uji('blok nonaktif disaring, blok aktif dipertahankan apa adanya', () => {
  const sumber = { nama: 'X', bio: '', foto: '', alamat: '', kontakWa: '' };
  const campur = bacaHalaman([
    { jenis: 'hero', judul: 'tampil' },
    { jenis: 'kontak', aktif: false },
  ]);
  const hasil = halamanAtauBawaan(campur, sumber, 'toko');
  assert.equal(hasil.length, 1);
  assert.equal(hasil[0].jenis, 'hero');
});

console.log('\nJangkar bagian halaman');

const PUNYA_KONTAK = { kontakWa: '628123', alamat: 'Kp. Bojong' };
const TANPA_KONTAK = { kontakWa: '', alamat: '' };

uji('jangkar memakai nama jenis, bukan id acak bloknya', () => {
  // Alamat yang disalin dari bilah alamat harus terbaca manusia, dan harus tetap
  // hidup kalau bloknya dihapus lalu dibuat ulang — id acak akan berubah.
  const blok = bacaHalaman([
    { jenis: 'hero' },
    { jenis: 'katalog' },
    { jenis: 'cerita', teks: 'x' },
    { jenis: 'kontak' },
  ]);
  const j = jangkarHalaman(blok);
  assert.deepEqual(
    blok.map((b) => j.get(b.id)),
    ['hero', 'produk', 'tentang', 'kontak']
  );
});

uji('blok kedua sejenis mendapat jangkar berbeda', () => {
  const blok = bacaHalaman([
    { jenis: 'katalog', judul: 'Terbaru' },
    { jenis: 'katalog', judul: 'Semua' },
  ]);
  const j = jangkarHalaman(blok);
  assert.deepEqual(
    blok.map((b) => j.get(b.id)),
    ['produk', 'produk-2'],
    'id ganda membuat lompatan jangkar selalu mendarat di yang pertama'
  );
});

uji('tombol sampul bawaan menuju jangkar yang benar-benar ada', () => {
  // `Hero` memakai `#produk` kalau sasarannya tidak diatur. Kalau jangkar blok
  // katalog suatu hari berubah namanya, tombol utama tiap halaman usaha akan
  // menuju tempat yang tidak ada, dan tidak ada galat yang muncul.
  const blok = bacaHalaman([{ jenis: 'hero' }, { jenis: 'katalog' }]);
  const j = jangkarHalaman(blok);
  assert.ok([...j.values()].includes('produk'));
});

console.log('\nBlok kosong tidak dirender');

uji('adaIsi menolak blok yang tidak akan merender apa pun', () => {
  // Yang paling gampang salah: bloknya ADA di susunan halaman, tapi isinya
  // kosong. Tanpa penjagaan ini halaman publik memuat kotak kosong.
  const blok = bacaHalaman([
    { jenis: 'galeri', foto: [] },
    { jenis: 'kontak', jamBuka: '' },
    { jenis: 'cerita', teks: '   ', foto: '' },
    { jenis: 'keunggulan', butir: [{ judul: '', teks: '' }] },
    { jenis: 'fakta', butir: [{ angka: '', label: '' }] },
  ]);
  for (const b of blok) assert.equal(adaIsi(b, TANPA_KONTAK), false, b.jenis);
});

uji('hero dan katalog selalu punya isi', () => {
  // Katalog tanpa produk pun berisi ajakan menghubungi lewat WhatsApp, dan hero
  // selalu punya setidaknya nama usahanya.
  const blok = bacaHalaman([{ jenis: 'hero' }, { jenis: 'katalog' }]);
  for (const b of blok) assert.equal(adaIsi(b, TANPA_KONTAK), true, b.jenis);
});

uji('kontak berisi kalau usahanya punya nomor, walau jamBuka kosong', () => {
  const [b] = bacaHalaman([{ jenis: 'kontak', jamBuka: '' }]);
  assert.equal(adaIsi(b, TANPA_KONTAK), false);
  assert.equal(adaIsi(b, PUNYA_KONTAK), true);
});

console.log('\nSorotan produk di halaman profil');

const BANYAK = Array.from({ length: 25 }, (_, i) => i);

uji('batas kosong memakai SOROT_KATALOG, bukan semuanya', () => {
  // Ini yang membedakan halaman profil dari halaman katalog. Kalau batas 0
  // berarti "semua" seperti dulu, halaman profil usaha berisi 25 barang kembali
  // mengubur cerita dan kontaknya belasan gulir ke bawah.
  assert.equal(sorotProduk(BANYAK, 0).length, SOROT_KATALOG);
});

uji('batas yang diatur pemiliknya dipatuhi', () => {
  assert.equal(sorotProduk(BANYAK, 3).length, 3);
});

uji('produk lebih sedikit dari sorotan tidak dipadati apa pun', () => {
  assert.deepEqual(sorotProduk([1, 2], 0), [1, 2]);
});

console.log('\nFoto di dalam blok');

const CL = 'https://res.cloudinary.com/x/image/upload/v1/';

uji('menemukan foto di semua jenis blok berfoto', () => {
  const blok = bacaHalaman([
    { jenis: 'hero', foto: CL + 'sampul.jpg' },
    { jenis: 'cerita', teks: 'x', foto: CL + 'cerita.jpg' },
    {
      jenis: 'galeri',
      foto: [
        { url: CL + 'g1.jpg', keterangan: '' },
        { url: CL + 'g2.jpg', keterangan: '' },
      ],
    },
  ]);
  const foto = fotoDalamBlok(blok);
  assert.equal(foto.length, 4);
  assert.ok(foto.includes(CL + 'g2.jpg'));
});

uji('URL non-Cloudinary tidak ikut terhitung', () => {
  const blok = bacaHalaman([
    { jenis: 'hero', foto: 'https://drive.google.com/uc?id=abc' },
    { jenis: 'cerita', teks: 'lihat https://contoh.id/foto.jpg', foto: '' },
  ]);
  assert.deepEqual(fotoDalamBlok(blok), []);
});

uji('URL yang sama dua kali dihitung sekali', () => {
  const blok = bacaHalaman([
    { jenis: 'hero', foto: CL + 'sama.jpg' },
    { jenis: 'galeri', foto: [{ url: CL + 'sama.jpg', keterangan: '' }] },
  ]);
  assert.deepEqual(fotoDalamBlok(blok), [CL + 'sama.jpg']);
});

uji('blok kosong tidak menghasilkan URL palsu', () => {
  assert.deepEqual(fotoDalamBlok([]), []);
  assert.deepEqual(fotoDalamBlok(bacaHalaman([{ jenis: 'katalog' }])), []);
});

console.log('\nTeks');

uji('paragraf dipecah dari baris kosong, bukan dari tag', () => {
  assert.deepEqual(keParagraf('satu\n\ndua'), ['satu', 'dua']);
  assert.deepEqual(keParagraf('satu\ndua'), ['satu\ndua']);
  assert.deepEqual(keParagraf('\n\n  \n\n'), []);
});

console.log(`\n${lulus} pemeriksaan lulus.\n`);
