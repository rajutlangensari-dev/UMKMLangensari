/**
 * Susunan halaman UMKM: tipe, pembaca yang aman, dan preset.
 *
 * Halaman `/umkm/<slug>` tidak lagi berbentuk tetap. Ia disusun dari BLOK yang
 * datanya disimpan sebagai JSON di satu sel sheet, sehingga tiap usaha bisa
 * punya halaman berbeda tanpa satu berkas baru pun ditulis dan tanpa deploy.
 *
 * DUA ATURAN YANG TIDAK BOLEH DILANGGAR
 *
 * 1. Data blok adalah MASUKAN YANG TIDAK DIPERCAYA. Ia melewati Google Sheets,
 *    tempat siapa pun yang punya akses spreadsheet bisa mengetiknya dengan
 *    tangan. Karena itu ia hanya boleh masuk lewat `bacaHalaman()`, yang
 *    menerima nilai apa pun dan selalu mengembalikan `Blok[]` yang sah. Satu sel
 *    salah ketik tidak boleh menjatuhkan halaman siapa pun.
 *
 * 2. Isinya TIDAK PERNAH dirender sebagai HTML. Tidak ada
 *    `dangerouslySetInnerHTML` di komponen blok mana pun. Teks berparagraf
 *    dipecah dari baris kosong, bukan dari tag.
 *
 * Jenis blok adalah daftar tertutup, dan itu disengaja. Penyunting bebas di
 * tangan orang yang bukan perancang menghasilkan teks putih di atas putih dan
 * enam jenis huruf. Keragamannya ada di isi, urutan, tema, dan tata letak.
 */

// ---------- Jenis ----------

export const JENIS_BLOK = [
  'hero',
  'cerita',
  'keunggulan',
  'fakta',
  'galeri',
  'katalog',
  'kontak',
] as const;

export type JenisBlok = (typeof JENIS_BLOK)[number];

/** Keterangan untuk pemilih "Tambah blok" di panel. */
export const LABEL_BLOK: Record<JenisBlok, { nama: string; jelas: string }> = {
  hero: { nama: 'Sampul', jelas: 'Bagian paling atas: nama usaha, kalimat pembuka, dan satu foto besar.' },
  cerita: { nama: 'Cerita', jelas: 'Paragraf panjang tentang usaha ini, boleh dengan satu foto pendamping.' },
  keunggulan: { nama: 'Keunggulan', jelas: 'Dua sampai empat hal yang membedakan usaha ini dari yang lain.' },
  fakta: { nama: 'Angka', jelas: 'Angka yang membuat orang percaya: lama berdiri, jumlah perajin, dan sejenisnya.' },
  galeri: { nama: 'Galeri', jelas: 'Kumpulan foto hasil kerja atau suasana tempat usaha.' },
  katalog: { nama: 'Katalog produk', jelas: 'Daftar barang yang dijual, diambil otomatis dari produk yang sudah dipasang.' },
  kontak: { nama: 'Kontak', jelas: 'Nomor WhatsApp, alamat, dan jam buka.' },
};

// ---------- Bentuk tiap blok ----------

interface Dasar {
  id: string;
  aktif: boolean;
}

export interface BlokHero extends Dasar {
  jenis: 'hero';
  judul: string;
  subJudul: string;
  foto: string;
  teksTombol: string;
  sasaranTombol: string;
}

export interface BlokCerita extends Dasar {
  jenis: 'cerita';
  judul: string;
  teks: string;
  foto: string;
  posisiFoto: 'kiri' | 'kanan';
}

export interface BlokKeunggulan extends Dasar {
  jenis: 'keunggulan';
  judul: string;
  butir: { judul: string; teks: string }[];
}

export interface BlokFakta extends Dasar {
  jenis: 'fakta';
  butir: { angka: string; label: string }[];
}

export interface BlokGaleri extends Dasar {
  jenis: 'galeri';
  judul: string;
  foto: { url: string; keterangan: string }[];
}

export interface BlokKatalog extends Dasar {
  jenis: 'katalog';
  judul: string;
  /** Jumlah produk yang disorot di halaman utama. 0 berarti pakai `SOROT_KATALOG`. */
  batas: number;
  kategoriAwal: string;
}

export interface BlokKontak extends Dasar {
  jenis: 'kontak';
  judul: string;
  jamBuka: string;
}

export type Blok =
  | BlokHero
  | BlokCerita
  | BlokKeunggulan
  | BlokFakta
  | BlokGaleri
  | BlokKatalog
  | BlokKontak;

// Batas jumlah butir. Bukan selera: keunggulan kelima tidak muat sebaris di
// layar lebar, dan galeri kesembilan berarti sembilan foto diunduh lewat data
// seluler untuk halaman yang mungkin cuma dilirik.
export const MAKS_KEUNGGULAN = 4;
export const MAKS_FAKTA = 4;
export const MAKS_GALERI = 8;

/**
 * Berapa produk yang disorot di halaman utama usaha kalau `batas` belum diatur.
 *
 * Halaman utama adalah PROFIL: yang dijualnya cukup terlihat, tidak perlu semua.
 * Daftar lengkapnya punya halamannya sendiri di `/umkm/<slug>/katalog`, dengan
 * pencarian dan saringan kategori — dan halaman itu tidak dibatasi angka ini.
 *
 * Delapan karena kisinya empat kolom di layar lebar dan dua di HP: delapan
 * mengisi dua baris penuh di keduanya, tanpa baris terakhir yang cuma berisi
 * satu kartu menggantung.
 */
export const SOROT_KATALOG = 8;

/**
 * Produk yang disorot di halaman profil usaha.
 *
 * Halaman katalognya TIDAK memakai fungsi ini — di sana daftarnya utuh. Kalau
 * suatu hari ia dipakai di kedua tempat, tidak akan ada halaman yang memuat
 * produk ke-9 seorang pun.
 */
export function sorotProduk<T>(produk: T[], batas: number): T[] {
  return produk.slice(0, batas > 0 ? batas : SOROT_KATALOG);
}

// ---------- Pembaca yang aman ----------

const teks = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const angka = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0);
const larik = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** ID pendek dan stabil. Dipakai sebagai key React dan sasaran penyuntingan. */
export function idBlok(): string {
  return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Satu penormal per jenis. Tabel, bukan rantai `if`, supaya menambah jenis baru
// berarti menambah satu baris di satu tempat dan bukan menambal empat berkas.
const PENORMAL: { [J in JenisBlok]: (m: Record<string, unknown>, d: Dasar) => Blok } = {
  hero: (m, d) => ({
    ...d,
    jenis: 'hero',
    judul: teks(m.judul),
    subJudul: teks(m.subJudul),
    foto: teks(m.foto),
    teksTombol: teks(m.teksTombol),
    sasaranTombol: teks(m.sasaranTombol),
  }),
  cerita: (m, d) => ({
    ...d,
    jenis: 'cerita',
    judul: teks(m.judul),
    teks: teks(m.teks),
    foto: teks(m.foto),
    posisiFoto: m.posisiFoto === 'kanan' ? 'kanan' : 'kiri',
  }),
  keunggulan: (m, d) => ({
    ...d,
    jenis: 'keunggulan',
    judul: teks(m.judul),
    butir: larik(m.butir)
      .slice(0, MAKS_KEUNGGULAN)
      .map((b) => {
        const o = (b ?? {}) as Record<string, unknown>;
        return { judul: teks(o.judul), teks: teks(o.teks) };
      }),
  }),
  fakta: (m, d) => ({
    ...d,
    jenis: 'fakta',
    butir: larik(m.butir)
      .slice(0, MAKS_FAKTA)
      .map((b) => {
        const o = (b ?? {}) as Record<string, unknown>;
        return { angka: teks(o.angka), label: teks(o.label) };
      }),
  }),
  galeri: (m, d) => ({
    ...d,
    jenis: 'galeri',
    judul: teks(m.judul),
    foto: larik(m.foto)
      .slice(0, MAKS_GALERI)
      .map((f) => {
        const o = (f ?? {}) as Record<string, unknown>;
        return { url: teks(o.url), keterangan: teks(o.keterangan) };
      })
      .filter((f) => f.url),
  }),
  katalog: (m, d) => ({
    ...d,
    jenis: 'katalog',
    judul: teks(m.judul),
    batas: Math.max(0, Math.min(60, Math.round(angka(m.batas)))),
    kategoriAwal: teks(m.kategoriAwal),
  }),
  kontak: (m, d) => ({
    ...d,
    jenis: 'kontak',
    judul: teks(m.judul),
    jamBuka: teks(m.jamBuka),
  }),
};

function normalkanBlok(mentah: unknown): Blok | null {
  if (!mentah || typeof mentah !== 'object' || Array.isArray(mentah)) return null;
  const m = mentah as Record<string, unknown>;
  const jenis = teks(m.jenis) as JenisBlok;
  // Jenis tak dikenal dibuang, BUKAN digagalkan. Halaman yang dibuat versi lebih
  // baru harus tetap tayang di versi lama, cuma tanpa blok yang belum dikenal.
  if (!PENORMAL[jenis]) return null;
  return PENORMAL[jenis](m, {
    id: teks(m.id) || idBlok(),
    // Hanya `false` yang mematikan. Blok lama tanpa field ini tetap tayang.
    aktif: m.aktif !== false,
  });
}

/**
 * Ubah apa pun yang datang dari backend jadi `Blok[]` yang sah.
 *
 * Menerima: teks JSON, array yang sudah terurai, `null`, angka, teks sampah.
 * Tidak pernah melempar. Yang tidak bisa dipahami dibuang diam-diam — halaman
 * publik yang tayang separuh jauh lebih baik daripada halaman yang mati total
 * gara-gara satu sel salah ketik.
 */
export function bacaHalaman(nilai: unknown): Blok[] {
  let mentah: unknown = nilai;
  if (typeof nilai === 'string') {
    const bersih = nilai.trim();
    if (!bersih) return [];
    try {
      mentah = JSON.parse(bersih);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(mentah)) return [];

  const hasil: Blok[] = [];
  const dipakai = new Set<string>();
  for (const item of mentah) {
    const blok = normalkanBlok(item);
    if (!blok) continue;
    // ID ganda membuat React salah memasangkan state saat blok diurutkan ulang.
    if (dipakai.has(blok.id)) blok.id = idBlok();
    dipakai.add(blok.id);
    hasil.push(blok);
  }
  return hasil;
}

/**
 * Kebalikannya: `Blok[]` jadi teks JSON siap simpan.
 *
 * Lewat `bacaHalaman` dulu supaya field asing yang terselip dari formulir tidak
 * ikut tersimpan dan tidak menumpuk di sel yang punya batas 50.000 karakter.
 */
export function tulisHalaman(blok: Blok[]): string {
  return JSON.stringify(bacaHalaman(blok));
}

// ---------- Jangkar ----------

/**
 * Jangkar tiap blok, dipakai `id=` di halaman dan sasaran tombol sampul.
 *
 * Memakai nama jenisnya (`#produk`, `#tentang`), bukan id acak bloknya, supaya
 * tautan yang disalin dari bilah alamat masih terbaca manusia — dan tetap hidup
 * kalau bloknya nanti dihapus lalu dibuat ulang, karena id acak akan berubah
 * sedangkan jenisnya tidak.
 *
 * Blok kedua dengan jenis sama diberi akhiran angka: `id` ganda membuat lompatan
 * jangkar selalu mendarat di yang pertama.
 *
 * Dulu fungsi ini juga menghasilkan label untuk nav dalam toko. Nav itu dibuang
 * — satu bilah menu berisi jangkar ke bagian-bagian halaman yang sama ternyata
 * cuma mengulang apa yang sudah terlihat saat digulir, sementara satu-satunya
 * tujuan yang benar-benar lain (katalog lengkap) tidak ada di situ. Yang tinggal
 * hanya jangkarnya, yang tetap dibutuhkan tombol sampul dan tautan `#produk`.
 */
export function jangkarHalaman(blok: Blok[]): Map<string, string> {
  const hasil = new Map<string, string>();
  const dipakai = new Map<JenisBlok, number>();

  for (const b of blok) {
    const n = (dipakai.get(b.jenis) ?? 0) + 1;
    dipakai.set(b.jenis, n);

    const dasar = b.jenis === 'katalog' ? 'produk' : b.jenis === 'cerita' ? 'tentang' : b.jenis;
    hasil.set(b.id, n === 1 ? dasar : `${dasar}-${n}`);
  }
  return hasil;
}

/** Data usaha yang menentukan apakah sebuah blok punya isi. */
export interface KontekIsi {
  kontakWa: string;
  alamat: string;
}

/**
 * Blok ini akan merender sesuatu, atau kosong melompong?
 *
 * Satu aturan di satu tempat, dijalankan `RenderBlok` sebelum komponen bloknya
 * dipanggil. Tiap komponen blok memutuskan sendiri berarti tujuh tempat yang
 * harus sepakat, dan suatu hari satu di antaranya akan merender kotak kosong.
 */
export function adaIsi(b: Blok, umkm: KontekIsi): boolean {
  switch (b.jenis) {
    case 'hero':
      return true;
    // Katalog selalu tampil: kalau produknya nol, ia justru menampilkan ajakan
    // menghubungi lewat WhatsApp, dan itu isi yang berguna.
    case 'katalog':
      return true;
    case 'cerita':
      return keParagraf(b.teks).length > 0 || Boolean(b.foto);
    case 'keunggulan':
      return b.butir.some((x) => x.judul.trim() || x.teks.trim());
    case 'fakta':
      return b.butir.some((x) => x.angka.trim() || x.label.trim());
    case 'galeri':
      return b.foto.length > 0;
    case 'kontak':
      return Boolean(umkm.kontakWa || umkm.alamat || b.jamBuka);
    default:
      return false;
  }
}

/**
 * Semua URL foto Cloudinary di dalam sekumpulan blok.
 *
 * Sengaja regex atas JSON-nya, BUKAN membaca field foto tiap jenis blok satu
 * per satu. Menambah jenis blok berfoto baru tidak menuntut apa pun diubah di
 * sini — dan yang terlewat di fungsi seperti ini tidak menimbulkan galat,
 * melainkan berkas yang menumpuk diam-diam sampai kuota habis.
 *
 * Cara yang sama dipakai `portalFotoDiBaris_` di Portal.gs, dengan alasan sama.
 */
export function fotoDalamBlok(blok: Blok[]): string[] {
  const cocok = JSON.stringify(blok).match(/https:\/\/res\.cloudinary\.com\/[^\s"'\\)]+/g);
  return [...new Set(cocok ?? [])];
}

/** Teks berparagraf tanpa HTML: baris kosong memisahkan paragraf. */
export function keParagraf(t: string): string[] {
  return t
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// ---------- Tema ----------

export const TEMA = ['zaitun', 'tanah', 'nila', 'sawah'] as const;
export type TemaPreset = (typeof TEMA)[number];
/**
 * Tema dapat berupa salah satu preset atau satu warna heksadesimal pilihan
 * pemilik. Nilai bebas tetap disaring ketat: hanya #RRGGBB yang boleh lewat,
 * sehingga ia aman dipasang sebagai custom property CSS.
 */
export type Tema = TemaPreset | `#${string}`;
export const TEMA_BAWAAN: TemaPreset = 'zaitun';

export const LABEL_TEMA: Record<TemaPreset, { nama: string; jelas: string }> = {
  zaitun: { nama: 'Zaitun', jelas: 'Warna portal desa. Tenang, cocok untuk hampir semua usaha.' },
  tanah: { nama: 'Tanah', jelas: 'Cokelat kemerahan. Cocok untuk kerajinan, gerabah, dan meubel.' },
  nila: { nama: 'Nila', jelas: 'Biru keunguan. Cocok untuk konveksi, batik, dan kain.' },
  sawah: { nama: 'Sawah', jelas: 'Hijau segar. Cocok untuk makanan, minuman, dan hasil kebun.' },
};

export function bacaTema(nilai: unknown): Tema {
  const t = teks(nilai).trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(t)) return t as `#${string}`;
  return TEMA.includes(t as TemaPreset) ? (t as TemaPreset) : TEMA_BAWAAN;
}

export function warnaTemaKustom(tema: Tema): `#${string}` | '' {
  return /^#[0-9a-f]{6}$/i.test(tema) ? (tema.toLowerCase() as `#${string}`) : '';
}

export function namaTema(tema: Tema): string {
  const kustom = warnaTemaKustom(tema);
  if (kustom) return `Warna khusus ${kustom.toUpperCase()}`;
  return LABEL_TEMA[tema as TemaPreset]?.nama ?? LABEL_TEMA[TEMA_BAWAAN].nama;
}

/** Nilai atribut CSS. Warna mentah tidak pernah dijadikan nama selector. */
export function atributTema(tema: Tema | undefined): TemaPreset | 'kustom' | undefined {
  if (!tema) return undefined;
  return warnaTemaKustom(tema) ? 'kustom' : (bacaTema(tema) as TemaPreset);
}

type Rgb = [number, number, number];
type PropertiTema = Record<`--tema-${string}`, string>;

function rgbDariHex(hex: string): Rgb {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function luminansi([r, g, b]: Rgb): number {
  const kanal = (n: number) => {
    const s = n / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

/** Diekspor supaya uji kontras warna bebas memakai rumus yang sama. */
export function rasioKontras(a: Rgb, b: Rgb): number {
  const terang = Math.max(luminansi(a), luminansi(b));
  const gelap = Math.min(luminansi(a), luminansi(b));
  return (terang + 0.05) / (gelap + 0.05);
}

function campur(asal: Rgb, tujuan: Rgb, jumlah: number): Rgb {
  return asal.map((n, i) => Math.round(n + (tujuan[i] - n) * jumlah)) as Rgb;
}

function amanDiLatar(asal: Rgb, latar: Rgb, tujuan: Rgb): Rgb {
  let hasil = asal;
  for (let i = 0; i < 16 && rasioKontras(hasil, latar) < 4.6; i++) {
    hasil = campur(hasil, tujuan, 0.12);
  }
  return hasil;
}

function teksDiAtas(aksen: Rgb): Rgb {
  const hitam: Rgb = [15, 15, 17];
  const putih: Rgb = [250, 250, 245];
  return rasioKontras(aksen, hitam) >= rasioKontras(aksen, putih) ? hitam : putih;
}

const triplet = (warna: Rgb) => warna.join(' ');

/**
 * Token untuk tema bebas. Warna pilihan berperan sebagai benih; versi terang
 * dan gelapnya disesuaikan sampai teks/tautan mencapai rasio WCAG AA 4,5:1.
 * Dengan begitu kuning sangat pucat dan biru sangat gelap tetap dapat dipilih
 * tanpa menghasilkan tombol yang tidak terbaca.
 */
export function gayaTema(tema: Tema | undefined): PropertiTema | undefined {
  const hex = tema ? warnaTemaKustom(tema) : '';
  if (!hex) return undefined;

  const benih = rgbDariHex(hex);
  const aksenTerang = amanDiLatar(benih, [255, 255, 255], [0, 0, 0]);
  const aksenGelap = amanDiLatar(benih, [15, 15, 17], [255, 255, 255]);

  return {
    '--tema-aksen-terang': triplet(aksenTerang),
    '--tema-aksen-kuat-terang': triplet(campur(aksenTerang, [0, 0, 0], 0.14)),
    '--tema-ink-terang': triplet(teksDiAtas(aksenTerang)),
    '--tema-aksen-gelap': triplet(aksenGelap),
    '--tema-aksen-kuat-gelap': triplet(campur(aksenGelap, [255, 255, 255], 0.14)),
    '--tema-ink-gelap': triplet(teksDiAtas(aksenGelap)),
    '--tema-benih': triplet(benih),
  };
}

// ---------- Tata letak ----------

export const TATA_LETAK = ['toko', 'portofolio', 'cerita'] as const;
export type TataLetak = (typeof TATA_LETAK)[number];
export const TATA_LETAK_BAWAAN: TataLetak = 'toko';

export const LABEL_TATA_LETAK: Record<
  TataLetak,
  { nama: string; jelas: string; sketsa: string }
> = {
  toko: {
    nama: 'Toko',
    jelas: 'Barangnya langsung terlihat. Untuk usaha yang jualannya banyak dan orang datang untuk membeli.',
    sketsa: 'Sampul ringkas → Katalog → Kontak → Cerita',
  },
  portofolio: {
    nama: 'Portofolio',
    jelas: 'Hasil kerja yang dijual. Untuk kerajinan, rajut, meubel, dan garapan pesanan.',
    sketsa: 'Sampul besar → Galeri → Katalog → Cerita → Kontak',
  },
  cerita: {
    nama: 'Cerita',
    jelas: 'Asal-usul dan prosesnya yang menjual. Untuk usaha yang punya riwayat panjang.',
    sketsa: 'Sampul → Cerita panjang → Angka → Katalog → Kontak',
  },
};

export function bacaTataLetak(nilai: unknown): TataLetak {
  const t = teks(nilai).toLowerCase() as TataLetak;
  return TATA_LETAK.includes(t) ? t : TATA_LETAK_BAWAAN;
}

/** Urutan jenis blok bawaan tiap tata letak. */
const SUSUNAN: Record<TataLetak, JenisBlok[]> = {
  toko: ['hero', 'katalog', 'kontak', 'cerita'],
  portofolio: ['hero', 'galeri', 'katalog', 'cerita', 'kontak'],
  cerita: ['hero', 'cerita', 'fakta', 'katalog', 'kontak'],
};

// ---------- Blok bawaan ----------

/** Data minimal yang dipakai menyusun halaman pertama. */
export interface SumberBawaan {
  nama: string;
  bio: string;
  foto: string;
  alamat: string;
  kontakWa: string;
}

/** Satu blok kosong berisi contoh, untuk tombol "Tambah blok" di panel. */
export function blokKosong(jenis: JenisBlok): Blok {
  const d = { id: idBlok(), aktif: true };
  switch (jenis) {
    case 'hero':
      return { ...d, jenis, judul: '', subJudul: '', foto: '', teksTombol: 'Lihat produk', sasaranTombol: '' };
    case 'cerita':
      return { ...d, jenis, judul: 'Tentang kami', teks: '', foto: '', posisiFoto: 'kiri' };
    case 'keunggulan':
      return {
        ...d,
        jenis,
        judul: 'Kenapa memilih kami',
        butir: [
          { judul: '', teks: '' },
          { judul: '', teks: '' },
        ],
      };
    case 'fakta':
      return {
        ...d,
        jenis,
        butir: [
          { angka: '', label: '' },
          { angka: '', label: '' },
        ],
      };
    case 'galeri':
      return { ...d, jenis, judul: 'Hasil kerja kami', foto: [] };
    case 'katalog':
      return { ...d, jenis, judul: 'Produk', batas: 0, kategoriAwal: '' };
    case 'kontak':
      return { ...d, jenis, judul: 'Hubungi kami', jamBuka: '' };
  }
}

/**
 * Susun halaman pertama dari data pendaftaran.
 *
 * Dipanggil saat UMKM didaftarkan, supaya halamannya sudah layak dibagikan
 * sebelum pemiliknya pernah masuk. Kalau blok harus diisi manual, 20 UMKM
 * berarti 20 halaman kosong — dan itu lebih buruk daripada profil seragam yang
 * digantikannya.
 *
 * Blok yang datanya belum ada tidak dibuat kosong; ia tidak dibuat sama sekali.
 * Kotak kosong di halaman publik terbaca sebagai situs rusak.
 */
export function halamanBawaan(sumber: SumberBawaan, tataLetak: TataLetak): Blok[] {
  const punyaCerita = Boolean(sumber.bio.trim());

  const buat: Partial<Record<JenisBlok, () => Blok | null>> = {
    hero: () => ({
      id: idBlok(),
      aktif: true,
      jenis: 'hero',
      judul: sumber.nama,
      subJudul: sumber.bio.trim().split(/\n/)[0]?.slice(0, 140) || `Produk buatan warga Desa Langensari.`,
      // Foto sampul sengaja DIKOSONGKAN, tidak diisi foto profil.
      //
      // Keduanya berperan beda: foto profil itu potret kecil dan bulat yang
      // sudah tampil di header, sedangkan sampul itu panorama lebar. Menyalin
      // yang satu jadi yang lain menghasilkan potret bulat yang direntangkan
      // 16:7 — dan halaman dibuka dengan dua salinan gambar yang sama.
      //
      // Kosong berarti halamannya dibuka dengan nama besar, kalimat pembuka,
      // dan barangnya. Pemiliknya bisa memasang sampul sendiri kapan saja.
      foto: '',
      teksTombol: 'Lihat produk',
      sasaranTombol: '',
    }),
    cerita: () =>
      punyaCerita
        ? {
            id: idBlok(),
            aktif: true,
            jenis: 'cerita',
            judul: 'Tentang usaha kami',
            teks: sumber.bio,
            foto: '',
            posisiFoto: 'kiri',
          }
        : null,
    katalog: () => ({ id: idBlok(), aktif: true, jenis: 'katalog', judul: 'Produk', batas: 0, kategoriAwal: '' }),
    kontak: () => ({ id: idBlok(), aktif: true, jenis: 'kontak', judul: `Hubungi ${sumber.nama}`, jamBuka: '' }),
    // Galeri dan fakta sengaja tidak dibuat otomatis: keduanya butuh bahan yang
    // belum ada saat pendaftaran, dan blok kosong lebih buruk daripada tidak ada.
    galeri: () => null,
    fakta: () => null,
  };

  return SUSUNAN[tataLetak]
    .map((jenis) => buat[jenis]?.() ?? null)
    .filter((b): b is Blok => b !== null);
}

/**
 * Halaman untuk UMKM yang belum punya susunan sama sekali.
 *
 * Ada supaya UMKM yang terdaftar sebelum fitur ini tetap tayang penuh tanpa
 * disunting siapa pun, dan supaya menghapus semua blok tidak menghasilkan
 * halaman kosong melompong.
 */
export function halamanAtauBawaan(
  halaman: Blok[],
  sumber: SumberBawaan,
  tataLetak: TataLetak
): Blok[] {
  const aktif = halaman.filter((b) => b.aktif);
  return aktif.length > 0 ? aktif : halamanBawaan(sumber, tataLetak);
}
