import type { Blok, Tema, TataLetak } from './blok';

export type { Blok, Tema, TataLetak };

export interface Produk {
  id: string;
  namaProduk: string;
  kategori: string;
  harga: number;
  stok: string;
  deskripsi: string;
  foto: string;
  kontakWa: string;
  /**
   * Nama usaha yang ditampilkan. Untuk produk yang memiliki `umkmId`, lapisan
   * baca menggantinya dengan nama terbaru dari Profil usaha. Nilai pada baris
   * produk hanya menjadi cadangan bagi data lawas yang belum terhubung.
   */
  namaUmkm: string;
  /** UMKM pemilik produk. Kosong berarti produk lama yang belum dipindahkan. */
  umkmId: string;
  alamat: string;
  status: string;
}

export type ProdukBaru = Omit<Produk, 'id'>;

export type StatusAktif = 'aktif' | 'nonaktif';

/**
 * Satu pelaku usaha yang punya halamannya sendiri di `/umkm/<slug>`.
 *
 * `slug` tidak pernah berubah setelah dibuat, meski `nama` diganti, supaya
 * tautan yang sudah tersebar lewat WhatsApp tidak mati.
 */
export interface Umkm {
  id: string;
  slug: string;
  nama: string;
  bio: string;
  foto: string;
  kontakWa: string;
  alamat: string;
  status: StatusAktif;
  dibuat: string;
  /**
   * Susunan blok halaman publiknya. Datang dari backend sebagai TEKS JSON dan
   * diuraikan oleh `bacaHalaman()` di lib/blok.ts.
   *
   * Jangan pernah menguraikannya dengan `JSON.parse` langsung di tempat lain:
   * isinya melewati Google Sheets dan bisa disunting manusia di sana, jadi ia
   * masukan yang tidak dipercaya seperti masukan pengguna mana pun.
   */
  halaman: Blok[];
  tema: Tema;
  tataLetak: TataLetak;
}

export type UmkmBaru = Omit<Umkm, 'id' | 'dibuat'>;

/**
 * Satu pelaku usaha beserta beberapa produknya, untuk sorotan di beranda.
 *
 * SENGAJA BUKAN `Umkm` utuh. Hero adalah komponen klien, jadi apa pun yang
 * dikirim ke sana ikut terserialisasi ke dalam HTML halaman muka — dan `Umkm`
 * membawa `halaman: Blok[]`, susunan blok lengkap yang bisa berisi puluhan ribu
 * karakter JSON per usaha. Lima usaha di carousel berarti lima susunan halaman
 * yang tidak dipakai sama sekali ikut diunduh tiap pengunjung, lewat jaringan
 * desa, untuk halaman yang mungkin cuma dilirik.
 *
 * Yang ada di sini persis yang dirender, tidak lebih.
 */
export interface SorotanUsaha {
  slug: string;
  nama: string;
  bio: string;
  foto: string;
  produk: Produk[];
}

export type Peran = 'admin' | 'umkm';

/**
 * Akun yang bisa masuk ke `/kelola`.
 *
 * `admin` (super admin) melihat dan mengubah semuanya, termasuk mendaftarkan
 * UMKM baru. `umkm` hanya menyentuh miliknya sendiri, ditentukan `umkmId`.
 *
 * Hash kata sandi sengaja tidak ada di tipe ini: nilainya tidak pernah keluar
 * dari backend, jadi kalau ada kode frontend yang mencoba membacanya, typecheck
 * yang menolak lebih dulu.
 */
export interface Akun {
  id: string;
  namaPengguna: string;
  peran: Peran;
  /** Wajib untuk peran `umkm`, selalu kosong untuk peran `admin`. */
  umkmId: string;
  status: StatusAktif;
  dibuat: string;
  terakhirMasuk: string;
}

/** Isi cookie sesi. Cukup untuk otorisasi, tanpa perlu membaca sheet tiap request. */
export interface Sesi {
  akunId: string;
  namaPengguna: string;
  peran: Peran;
  umkmId: string;
}

// Tipe `Profil` dihapus. Dulu mewakili profil satu toko di sheet `Profil`, yang
// tampil di /tentang. Isinya sudah pindah jadi baris pertama sheet `UMKM`, dan
// yang mewakilinya sekarang adalah `Umkm` di atas.
