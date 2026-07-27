import type { Produk, ProdukBaru, Profil } from './types';

const PROFIL_KOSONG: Profil = { namaToko: '', bio: '', foto: '', kontakWa: '', alamat: '' };

const BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

function urlBackend(): string {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_APPS_SCRIPT_URL belum diatur. Lihat frontend/.env.example.');
  }
  return BASE_URL;
}

// Google Sheets mengembalikan tipe asli sel (angka jadi number, bukan string),
// jadi nomor WA yang diketik tanpa format teks bisa datang sebagai number.
// Semua field dipaksa ke tipe yang dijanjikan Produk di satu titik ini, supaya
// pemanggil lain (kartu produk, halaman detail, dst) tidak perlu jaga-jaga sendiri.
function normalisasiProduk(raw: Record<string, unknown>): Produk {
  return {
    id: String(raw.id ?? ''),
    namaProduk: String(raw.namaProduk ?? ''),
    kategori: String(raw.kategori ?? ''),
    harga: Number(raw.harga) || 0,
    stok: String(raw.stok ?? ''),
    deskripsi: String(raw.deskripsi ?? ''),
    foto: String(raw.foto ?? ''),
    kontakWa: String(raw.kontakWa ?? ''),
    namaUmkm: String(raw.namaUmkm ?? ''),
    alamat: String(raw.alamat ?? ''),
    status: String(raw.status ?? ''),
  };
}

export async function ambilProdukAktif(): Promise<Produk[]> {
  const res = await fetch(`${urlBackend()}?action=list`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Data produk tidak dapat dimuat.');
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error(json.error || 'Format data produk tidak valid.');
  return json.map(normalisasiProduk);
}

/**
 * Daftar produk untuk panel admin, termasuk yang belum aktif.
 *
 * Memakai GET dengan token di query string, mengikuti Apps Script yang sedang
 * ter-deploy sekarang.
 *
 * CATATAN: query string ikut tercatat di log eksekusi Apps Script, riwayat
 * browser, dan proxy di jalur, jadi kata sandi admin tersimpan di beberapa
 * tempat. Versi POST yang tidak punya masalah itu sudah ada di
 * `Katalog/backend/Code.gs` (aksi `list` di doPost). Setelah Apps Script
 * di-deploy ulang, ganti isi fungsi ini jadi:
 *
 *     const rows = await kirimPerintah(token, 'list');
 *     if (!Array.isArray(rows)) throw new Error('Format data produk tidak valid.');
 *     return rows.map(normalisasiProduk);
 */
export async function ambilProdukSemua(token: string): Promise<Produk[]> {
  const res = await fetch(`${urlBackend()}?action=list&all=1&token=${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Data produk tidak dapat dimuat.');
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error(json.error || 'Kata sandi salah atau server sedang bermasalah.');
  return json.map(normalisasiProduk);
}

// Apps Script tidak menangani preflight OPTIONS, jadi body request dikirim sebagai
// text/plain. Header itu membuat browser menganggap ini "simple request" dan tidak
// mengirim preflight CORS sebelum request sebenarnya.
async function kirimPerintah(token: string, action: string, data?: Record<string, unknown>) {
  const res = await fetch(urlBackend(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token, action, data }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Permintaan tidak dapat diproses.');
  return json.data;
}

export const buatProduk = (token: string, data: ProdukBaru) => kirimPerintah(token, 'create', data);

export const perbaruiProduk = (token: string, id: string, data: Partial<Produk>) =>
  kirimPerintah(token, 'update', { ...data, id });

export const hapusProduk = (token: string, id: string) => kirimPerintah(token, 'delete', { id });

export async function ambilProfil(): Promise<Profil> {
  const res = await fetch(`${urlBackend()}?action=profil`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Profil tidak dapat dimuat.');
  const json = await res.json();
  if (json && json.error) throw new Error(json.error);
  // Semua field dipaksa string; field yang belum diisi jatuh ke default kosong.
  return {
    namaToko: String(json.namaToko ?? ''),
    bio: String(json.bio ?? ''),
    foto: String(json.foto ?? ''),
    kontakWa: String(json.kontakWa ?? ''),
    alamat: String(json.alamat ?? ''),
  };
}

export const simpanProfil = (token: string, data: Profil) => kirimPerintah(token, 'simpanProfil', { ...data });

export { PROFIL_KOSONG };

/**
 * Rapikan URL foto sebelum dipakai di <img>.
 *
 * Dua pekerjaan:
 * 1. Link share Google Drive diubah jadi URL gambar langsung. Foto baru
 *    di-upload lewat Cloudinary, tapi kolom Foto masih boleh diisi tempel link
 *    Drive manual, jadi jalur itu tetap dijaga.
 * 2. Link Cloudinary disisipi transformasi ukuran.
 *
 * Bagian kedua ini penting dan bukan optimasi kosmetik. Batas upload 5 MB per
 * foto, jadi katalog 20 produk bisa menyeret 60 MB sekali buka halaman. Yang
 * membuka mayoritas HP murah dengan kuota terbatas di desa. `w_<lebar>` memotong
 * ukuran ke yang benar-benar tampil, `f_auto` mengirim WebP/AVIF kalau browser
 * sanggup, `q_auto` menyetel kompresi. 3 MB jatuh ke puluhan KB.
 *
 * `lebar` adalah lebar tampil terbesar di CSS, dikali dua untuk layar retina.
 * Kalau URL-nya bukan Cloudinary, fungsi ini melewatkannya apa adanya.
 */
export function normalisasiFotoUrl(url: string, lebar?: number): string {
  if (!url) return '';

  const cocokPath = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const cocokQuery = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = cocokPath?.[1] || cocokQuery?.[1];
  if (fileId) return `https://drive.google.com/uc?export=view&id=${fileId}`;

  // Sisipkan tepat setelah "/upload/". Kalau sudah pernah disisipi (URL dari
  // sheet yang dicopy dari tampilan), jangan ditumpuk dua kali.
  if (lebar && url.includes('/image/upload/') && !/\/upload\/[a-z]_/.test(url)) {
    return url.replace('/image/upload/', `/image/upload/w_${lebar},f_auto,q_auto/`);
  }
  return url;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const MAKS_FOTO_MB = 5;

/** Upload file gambar langsung dari browser ke Cloudinary, balikin URL siap pakai. */
export async function uploadFoto(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET belum diatur di .env.local.'
    );
  }
  // Guard sisi klien: tolak file salah jenis atau kegedean sebelum menembak Cloudinary.
  // Batasan yang benar-benar dipaksakan tetap di setelan upload preset (server).
  if (!file.type.startsWith('image/')) {
    throw new Error('Pilih file gambar berformat JPG, PNG, atau WebP.');
  }
  if (file.size > MAKS_FOTO_MB * 1024 * 1024) {
    throw new Error(`Ukuran foto maksimal ${MAKS_FOTO_MB} MB. Kompres dulu fotonya.`);
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Foto tidak dapat diunggah.');
  return json.secure_url as string;
}

export function tautanWhatsapp(nomor: string, namaProduk: string): string {
  const pesan = `Halo, saya ingin menanyakan ${namaProduk} yang saya lihat di Katalog Rajut Langensari. Apakah masih tersedia?`;
  const nomorBersih = nomor.replace(/[^0-9]/g, '').replace(/^0/, '62');
  return `https://wa.me/${nomorBersih}?text=${encodeURIComponent(pesan)}`;
}

export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    angka || 0
  );
}
