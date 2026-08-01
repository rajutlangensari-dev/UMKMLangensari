import type { Produk } from './types';

/**
 * Pembacaan publik dan pembantu tampilan. Dipakai komponen klien maupun server.
 *
 * TIDAK ADA FUNGSI TULIS DI SINI, dan itu disengaja. Semua penulisan lewat
 * Route Handler `/api/...` yang membuktikan identitas dengan cookie sesi.
 * Versi lama berkas ini punya `ambilProdukSemua(token)`, `buatProduk(token, ...)`
 * dan seterusnya — kata sandi admin ikut dari browser sampai ke Apps Script,
 * dan pada jalur GET ia mendarat di query string yang tercatat di riwayat
 * peramban, log Apps Script, serta proxy di jalan. Seluruhnya dihapus.
 *
 * Kalau nanti butuh menulis sesuatu, tambahkan Route Handler baru — jangan
 * mengembalikan parameter token ke berkas ini.
 */

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
    // Dinormalkan di sini juga, bukan cuma saat tautannya dirakit: nomor yang
    // sudah kehilangan nol depannya di Sheets akan tampil apa adanya di panel,
    // dan yang membacanya menyangka datanya rusak.
    kontakWa: nomorWa(String(raw.kontakWa ?? '')),
    namaUmkm: String(raw.namaUmkm ?? ''),
    umkmId: String(raw.umkmId ?? ''),
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

/**
 * Upload file gambar langsung dari browser ke Cloudinary, balikin URL siap pakai.
 *
 * PEMBERSIHANNYA ADA DI BACKEND, BUKAN DI SINI. Setiap kali baris produk atau
 * UMKM disimpan, Apps Script membandingkan foto lama dengan yang baru dan
 * menghapus yang sudah tidak dipakai siapa pun (`portalSapuFoto_`). Sengaja di
 * sana: browser tidak boleh memegang kunci penghapusan Cloudinary, dan hanya
 * sheet yang tahu apakah sebuah URL masih dipakai di tempat lain.
 *
 * Foto yang diunggah lalu tidak jadi dipakai — diganti, dibuang, atau
 * formulirnya dibatalkan — dibereskan `lupakanFoto()` di bawah.
 */
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

/**
 * Beri tahu backend bahwa foto ini tidak jadi dipakai.
 *
 * Dipanggil saat foto diganti, dibuang, atau formulirnya dibatalkan — kejadian
 * yang tidak meninggalkan jejak apa pun di sheet, sehingga tidak akan pernah
 * ditemukan pembandingan lama-vs-baru saat menyimpan.
 *
 * MENEMBAK DAN LUPA, DAN ITU DISENGAJA. Yang sedang dikerjakan orangnya adalah
 * membatalkan atau mengganti foto; gagal menyapu berkas di Cloudinary tidak
 * boleh menghentikan itu, dan tidak ada yang perlu dia lakukan kalau gagal.
 * Akibat terburuknya satu berkas tertinggal — persis keadaan sebelum fungsi ini
 * ada.
 *
 * Aman dipanggil dengan URL apa pun: backend menolak menghapus yang masih
 * dipakai baris mana pun.
 */
export function lupakanFoto(url: string | string[]): void {
  const daftar = (Array.isArray(url) ? url : [url]).filter(
    (u) => u && u.includes('res.cloudinary.com')
  );
  if (daftar.length === 0) return;

  fetch('/api/foto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: daftar }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Versi untuk halaman yang sedang ditinggalkan.
 *
 * `fetch` biasa dibatalkan peramban saat halaman dibongkar, jadi permintaannya
 * sering tidak pernah sampai. `sendBeacon` memang dibuat untuk keadaan ini:
 * permintaannya diserahkan ke peramban dan tetap dikirim setelah halamannya
 * hilang. Cookie sesi ikut terbawa karena tujuannya satu asal.
 */
export function lupakanFotoSaatPergi(url: string[]): void {
  const daftar = url.filter((u) => u && u.includes('res.cloudinary.com'));
  if (daftar.length === 0) return;

  const isi = JSON.stringify({ url: daftar });
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/foto', new Blob([isi], { type: 'application/json' }));
    return;
  }
  lupakanFoto(daftar);
}

/**
 * Nomor Indonesia apa pun bentuknya jadi format yang diterima wa.me: `62…`.
 *
 * KENAPA INI PERLU. Nomor disimpan di Google Sheets, dan Sheets membaca
 * `081234567890` sebagai ANGKA lalu membuang nol depannya. Yang tersimpan
 * jadi `81234567890`. Versi lama cuma menulis `.replace(/^0/, '62')` — yang
 * tidak melakukan apa-apa pada nomor yang nol-nya sudah hilang, sehingga
 * tautannya menjadi `wa.me/81234567890` dan berujung ke nomor tak dikenal.
 * Tombol "Pesan lewat WhatsApp" pada produk itu diam-diam mati.
 *
 * Karena itu awalannya dipulihkan dari BENTUKNYA, bukan diandalkan ada:
 *
 *   +62 812-3456-7890  ->  6281234567890
 *   0812 3456 7890     ->  6281234567890
 *   81234567890        ->  6281234567890   <- yang dirusak Sheets
 *   6281234567890      ->  6281234567890
 *
 * Nomor rumah berawalan 0 selain 8 (misal 022) tetap diterjemahkan ke 62 juga:
 * itu benar untuk telepon, dan WhatsApp yang akan menolaknya kalau memang
 * bukan nomor WhatsApp. Yang tidak boleh terjadi adalah tautan bisu.
 */
export function nomorWa(nomor: string): string {
  const angka = String(nomor || '').replace(/[^0-9]/g, '');
  if (!angka) return '';
  if (angka.startsWith('62')) return angka;
  if (angka.startsWith('0')) return `62${angka.slice(1)}`;
  return `62${angka}`;
}

export function tautanWhatsapp(nomor: string, namaProduk: string): string {
  const pesan = `Halo, saya ingin menanyakan ${namaProduk} yang saya lihat di UMKM Langensari. Apakah masih tersedia?`;
  return `https://wa.me/${nomorWa(nomor)}?text=${encodeURIComponent(pesan)}`;
}

export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    angka || 0
  );
}
