import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Panduan usaha',
  description:
    'Panduan memakai akun toko UMKM Langensari, mulai dari masuk hingga menambah produk dan mengatur halaman usaha.',
};

type Tutorial = {
  id: string;
  judul: string;
  ringkas: string;
  langkah: string[];
  gambar: string;
  alt: string;
  keterangan: string;
};

const TUTORIAL: Tutorial[] = [
  {
    id: 'masuk',
    judul: 'Masuk ke akun toko',
    ringkas: 'Gunakan nama pengguna dan kata sandi yang diberikan pengelola portal.',
    langkah: [
      'Tekan MASUK pada header portal.',
      'Isi Nama pengguna dan Kata sandi.',
      'Tekan Tampilkan jika Anda perlu memeriksa kata sandi yang diketik.',
      'Tekan Masuk. Portal akan membuka beranda panel akun Anda.',
    ],
    gambar: '/panduan/01-masuk.webp',
    alt: 'Form masuk yang memuat kolom nama pengguna, kata sandi, dan tombol Masuk',
    keterangan: 'Form masuk akun toko.',
  },
  {
    id: 'beranda-panel',
    judul: 'Periksa beranda panel',
    ringkas: 'Beranda merangkum produk yang tayang dan bagian profil yang perlu Anda lengkapi.',
    langkah: [
      'Baca ringkasan di bagian atas untuk mengetahui keadaan toko Anda.',
      'Tekan salah satu catatan pada Yang bisa dilengkapi untuk membuka bagian yang perlu diperbaiki.',
      'Gunakan menu di sebelah kiri. Pada ponsel, tekan tombol Menu lebih dahulu.',
      'Tekan Lihat halaman saya untuk memeriksa tampilan yang dilihat pembeli.',
    ],
    gambar: '/panduan/02-dashboard.webp',
    alt: 'Beranda panel pemilik usaha dengan ringkasan produk dan menu pengelolaan',
    keterangan: 'Beranda panel akun toko.',
  },
  {
    id: 'produk',
    judul: 'Tambah dan ubah produk',
    ringkas: 'Setiap produk memerlukan nama, harga, stok, kategori, dan foto yang jelas.',
    langkah: [
      'Buka Produk saya, lalu tekan Tambah produk.',
      'Pilih foto produk. Isi Nama produk, Harga, Stok, dan Kategori.',
      'Tambahkan deskripsi singkat yang menjelaskan bahan, ukuran, atau cara pemesanan.',
      'Pilih status Aktif agar produk tampil kepada pembeli, lalu tekan Simpan.',
      'Gunakan tombol Ubah atau Hapus pada daftar produk jika datanya perlu diperbarui.',
    ],
    gambar: '/panduan/03-produk.webp',
    alt: 'Form tambah produk pada panel akun toko',
    keterangan: 'Form untuk menambahkan produk.',
  },
  {
    id: 'profil',
    judul: 'Lengkapi profil usaha',
    ringkas: 'Profil yang lengkap membantu pembeli mengenali usaha dan menghubungi Anda.',
    langkah: [
      'Buka Profil usaha dari menu panel.',
      'Unggah foto usaha, lalu periksa nama, nomor WhatsApp, alamat, dan keterangan usaha.',
      'Pilih warna halaman dari preset atau gunakan pemilih warna bebas.',
      'Pilih bentuk halaman Toko, Portofolio, atau Cerita sesuai kebutuhan usaha.',
      'Tekan Simpan profil setelah semua data diperiksa.',
    ],
    gambar: '/panduan/04-profil.webp',
    alt: 'Form profil usaha dengan data kontak, tema warna, dan pilihan bentuk halaman',
    keterangan: 'Pengaturan profil dan tampilan usaha.',
  },
  {
    id: 'halaman',
    judul: 'Susun halaman toko',
    ringkas: 'Atur urutan sampul, cerita, galeri, produk, dan kontak dari Halaman saya.',
    langkah: [
      'Buka Halaman saya untuk melihat daftar blok yang membentuk halaman toko.',
      'Tekan Ubah pada blok yang ingin disunting. Gunakan Naik atau Turun untuk mengatur urutannya.',
      'Tekan Tambah blok jika Anda memerlukan galeri, keunggulan, angka, atau bagian lain.',
      'Periksa hasilnya pada Pratinjau di bagian bawah.',
      'Tekan Simpan halaman. Buka halaman publik untuk memeriksa foto, teks, katalog, dan tombol WhatsApp.',
    ],
    gambar: '/panduan/05-halaman.webp',
    alt: 'Penyunting halaman toko dengan daftar blok dan pratinjau halaman publik',
    keterangan: 'Penyunting susunan halaman toko.',
  },
  {
    id: 'kata-sandi',
    judul: 'Ganti kata sandi',
    ringkas: 'Ganti kata sandi jika orang lain mengetahuinya atau jika pengelola meminta pembaruan.',
    langkah: [
      'Buka Kata sandi dari menu panel.',
      'Isi kata sandi sekarang.',
      'Buat kata sandi baru dengan sedikitnya 10 karakter, lalu ketik ulang.',
      'Tekan Ganti kata sandi dan simpan kata sandi baru di tempat yang aman.',
    ],
    gambar: '/panduan/06-sandi.webp',
    alt: 'Form untuk mengganti kata sandi akun toko',
    keterangan: 'Form penggantian kata sandi.',
  },
];

// Isi keychain QR yang dibagikan di workshop. Dibaca ulang di rumah, dari HP,
// sering oleh pembaca lanjut usia, jadi ukuran huruf di sini sengaja lebih besar
// daripada halaman katalog dan kalimatnya dipendekkan.
//
// Nomor urut di halaman ini bukan hiasan: ini memang jalur berurutan. NIB harus
// ada sebelum toko online dan QRIS bisa dibuka, dan syarat KUR juga NIB.

type Bagian = {
  judul: string;
  ringkas: string;
  langkah: string[];
  hasil: string;
  catatan?: string;
};

const BAGIAN: Bagian[] = [
  {
    judul: 'Urus NIB lewat OSS',
    ringkas:
      'NIB adalah nomor izin usaha. Gratis, cukup pakai NIK dari KTP, selesai sekitar 30 menit.',
    langkah: [
      'Buka oss.go.id dari HP atau laptop.',
      'Pilih Daftar, isi NIK dan nomor HP yang aktif.',
      'Pilih skala usaha Mikro, lalu isi jenis usaha dan alamat.',
      'Simpan NIB yang keluar. Difoto juga tidak apa-apa.',
    ],
    hasil: 'Punya NIB.',
    catatan:
      'Kerjakan ini paling awal. Toko online, QRIS, dan pengajuan KUR semuanya meminta NIB.',
  },
  {
    judul: 'Foto produk pakai HP',
    ringkas: 'Tidak perlu kamera mahal. Yang menentukan cahaya dan latar belakang.',
    langkah: [
      'Pakai latar polos. Kain putih, karton, atau tembok bersih sudah cukup.',
      'Foto siang hari di dekat jendela. Jangan pakai lampu kilat.',
      'Ambil dari atas dan dari samping, masing-masing beberapa kali.',
      'Pilih 3 sampai 5 foto yang paling jelas.',
    ],
    hasil: 'Punya 3 sampai 5 foto yang layak dipajang.',
  },
  {
    judul: 'Buka toko Shopee atau Tokopedia',
    ringkas:
      'Untuk produk yang tahan lama dan bisa dikirim, seperti olahan kering, peci, dan meubel.',
    langkah: [
      'Pasang aplikasi Shopee, pilih menu Mulai Jual.',
      'Isi nama toko, alamat pengambilan barang, dan nomor rekening.',
      'Unggah satu produk lebih dulu, lengkap dengan harga dan berat.',
      'Atur ongkos kirim, lalu terbitkan.',
    ],
    hasil: 'Toko aktif dengan satu produk terpajang.',
    catatan:
      'Pilih Shopee biasa, bukan ShopeeFood. ShopeeFood untuk makanan siap santap, bukan untuk barang kiriman.',
  },
  {
    judul: 'Masuk katalog UMKM Langensari',
    ringkas:
      'Etalase bersama milik desa. Pembeli melihat produk, lalu menghubungi pembuatnya langsung lewat WhatsApp.',
    langkah: [
      'Siapkan foto produk, harga, dan nomor WhatsApp yang aktif.',
      'Serahkan ke panitia untuk dimasukkan ke katalog.',
      'Periksa tampilan produk Anda di halaman katalog.',
      'Kabari panitia kalau harga berubah atau stok habis.',
    ],
    hasil: 'Produk tampil di katalog desa.',
  },
  {
    judul: 'Pasang QRIS untuk terima pembayaran',
    ringkas:
      'Satu kode untuk semua aplikasi pembayaran. Pembeli tinggal memindai, uang masuk ke rekening.',
    langkah: [
      'Datang ke bank atau buka aplikasi dompet digital yang Anda pakai.',
      'Ajukan QRIS untuk usaha, siapkan NIB dan KTP.',
      'Cetak kodenya, tempel di tempat yang terlihat pembeli.',
      'Coba sekali dengan nominal kecil sebelum dipakai berjualan.',
    ],
    hasil: 'QRIS terpasang dan sudah dicoba.',
  },
  {
    judul: 'Daftarkan usaha di Google Maps',
    ringkas: 'Untuk warung atau kios yang punya tempat tetap. Gratis.',
    langkah: [
      'Buka Google Maps, cari nama usaha Anda.',
      'Kalau belum ada, pilih Tambahkan Bisnis Anda.',
      'Isi nama, alamat, jam buka, dan nomor HP.',
      'Unggah foto tempat usaha dan produknya.',
    ],
    hasil: 'Usaha muncul saat orang mencari di sekitar Langensari.',
  },
  {
    judul: 'Pisahkan uang usaha dan uang dapur',
    ringkas:
      'Ini yang paling sering terlewat. Kalau uangnya bercampur, untung rugi tidak pernah kelihatan.',
    langkah: [
      'Siapkan dua tempat terpisah. Dua amplop sudah cukup, dua rekening lebih baik.',
      'Semua hasil jualan masuk ke tempat usaha lebih dulu.',
      'Tentukan jumlah tetap untuk diambil sebagai gaji Anda tiap minggu.',
      'Belanja bahan hanya dari uang usaha.',
    ],
    hasil: 'Uang usaha dan uang rumah tidak lagi bercampur.',
  },
  {
    judul: 'Catat kas dan hitung untung',
    ringkas:
      'Untung bukan sisa uang di tangan. Untung adalah harga jual dikurangi semua yang Anda keluarkan.',
    langkah: [
      'Catat tiap pemasukan dan pengeluaran. Buku tulis boleh, aplikasi BukuWarung atau BukuKas juga gratis.',
      'Untuk satu produk, jumlahkan bahan, gas, kemasan, dan waktu kerja Anda.',
      'Bandingkan jumlah itu dengan harga jual Anda sekarang.',
      'Kalau selisihnya tipis atau minus, naikkan harga atau tekan biaya bahan.',
    ],
    hasil: 'Tahu untung sebenarnya dari tiap produk.',
    catatan: 'Tenaga Anda sendiri tetap dihitung sebagai biaya. Kalau tidak, harganya jadi terlalu murah.',
  },
  {
    judul: 'Modal usaha: KUR, bukan pinjol',
    ringkas:
      'KUR adalah kredit usaha dari bank, bunganya rendah. Pinjaman online cepat cair tapi bunganya mencekik.',
    langkah: [
      'Datang ke BJB atau BRI, tanyakan KUR Mikro.',
      'Siapkan NIB, KTP, dan catatan kas Anda.',
      'Ajukan sesuai kebutuhan usaha, bukan lebih.',
      'Jangan mengambil pinjaman online untuk keperluan apa pun.',
    ],
    hasil: 'Tahu ke mana meminjam kalau butuh modal.',
    catatan:
      'Penting: cicilan untuk keperluan konsumsi, misalnya HP atau motor, bisa menaikkan penilaian ekonomi keluarga Anda di data pemerintah. Kalau naik, bantuan sosial dan KIS bisa berhenti. Pinjaman untuk modal usaha diperlakukan berbeda. Pinjam untuk usaha, bukan untuk gaya hidup.',
  },
  {
    judul: 'Langkah lanjut',
    ringkas: 'Kerjakan berurutan. Tidak perlu selesai semua dalam satu hari.',
    langkah: [
      'Minggu ini: urus NIB dan foto ulang produk Anda.',
      'Minggu depan: buka toko online dan masukkan produk ke katalog desa.',
      'Setelah NIB keluar: ajukan QRIS.',
      'Mulai sekarang juga: pisahkan uang usaha dan mulai mencatat.',
    ],
    hasil: 'Punya urutan yang jelas untuk dikerjakan sendiri di rumah.',
    catatan:
      'Kalau ada yang macet, tanyakan ke panitia KKN saat pendampingan atau ke perangkat desa di balai desa.',
  },
];

export default function HalamanPanduan() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-aksen px-5 pb-14 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-aksen-ink text-balance sm:text-5xl">
              Panduan akun toko
            </h1>
            <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-aksen-ink/85 text-pretty">
              Pelajari cara masuk, menambah produk, mengatur profil, dan memeriksa halaman toko Anda.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[17rem_1fr] lg:gap-14">
          <nav aria-label="Tutorial akun toko" className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-lg font-bold text-ink">Tutorial akun toko</h2>
            <ol className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
              {TUTORIAL.map((tutorial, i) => (
                <li key={tutorial.id} className="min-w-64 snap-start lg:min-w-0">
                  <a
                    href={`#${tutorial.id}`}
                    className="flex min-h-11 items-center gap-3 rounded-kartu border border-line bg-surface px-4 py-3 font-body text-sm text-ink transition-[color,border-color,background-color] hover:border-aksen hover:bg-paper"
                  >
                    <span className="angka-rata font-semibold text-aksen-kuat">{i + 1}</span>
                    {tutorial.judul}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            {TUTORIAL.map((tutorial, i) => (
              <article
                key={tutorial.id}
                id={tutorial.id}
                className="scroll-mt-24 border-t border-line py-10 first:border-0 first:pt-0 sm:py-14"
              >
                <div className="flex items-start gap-4">
                  <span className="angka-rata flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aksen font-body text-sm font-bold text-aksen-ink">
                    {i + 1}
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink text-balance sm:text-3xl">
                      {tutorial.judul}
                    </h2>
                    <p className="mt-3 max-w-2xl font-body leading-relaxed text-muted text-pretty">
                      {tutorial.ringkas}
                    </p>
                  </div>
                </div>

                <figure className="mt-7 overflow-hidden rounded-kartu border border-line bg-surface">
                  <a href={tutorial.gambar} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={tutorial.gambar}
                      alt={tutorial.alt}
                      width={1280}
                      height={900}
                      className="h-auto w-full"
                    />
                  </a>
                  <figcaption className="border-t border-line px-4 py-3 font-body text-xs text-muted">
                    {tutorial.keterangan} Tekan gambar untuk membukanya dalam ukuran penuh.
                  </figcaption>
                </figure>

                <ol className="mt-7 space-y-4">
                  {tutorial.langkah.map((langkah, j) => (
                    <li key={langkah} className="flex gap-4">
                      <span className="angka-rata mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface font-body text-xs font-semibold text-ink">
                        {j + 1}
                      </span>
                      <span className="max-w-2xl font-body leading-relaxed text-ink/85 text-pretty">
                        {langkah}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-line pt-14 sm:pt-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
              Materi berjualan digital
            </h2>
            <p className="mt-3 max-w-2xl font-body leading-relaxed text-muted text-pretty">
              Gunakan materi berikut saat Anda menyiapkan izin, foto, pembayaran, dan catatan usaha.
            </p>
          </div>

        {/* Daftar isi berupa tautan lompat. Di HP, halaman sepanjang ini tanpa
            daftar isi memaksa orang menggulir jauh untuk mencari satu bagian. */}
        <nav aria-label="Daftar isi" className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          <h2 className="font-body text-[0.68rem] uppercase tracking-label text-ink/70">
            Isi panduan
          </h2>
          <ol className="mt-5 space-y-1">
            {BAGIAN.map((b, i) => (
              <li key={b.judul}>
                <a
                  href={`#bagian-${i + 1}`}
                  className="flex gap-4 rounded-[14px] px-3 py-3 font-body text-ink/85 transition-colors hover:bg-surface hover:text-brick"
                >
                  <span className="font-display font-extrabold text-brick">{i + 1}</span>
                  <span>{b.judul}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
          {BAGIAN.map((b, i) => (
            <section
              key={b.judul}
              id={`bagian-${i + 1}`}
              className="scroll-mt-28 border-t border-ink/12 py-12 sm:py-16"
            >
              <p className="font-display text-5xl font-extrabold leading-none text-brick">
                {i + 1}
              </p>
              <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight tracking-[-0.01em] text-ink text-balance sm:text-3xl">
                {b.judul}
              </h2>
              <p className="mt-4 font-body text-lg leading-relaxed text-ink/80 text-pretty">
                {b.ringkas}
              </p>

              <ol className="mt-7 space-y-4">
                {b.langkah.map((l, j) => (
                  <li key={l} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface font-body text-sm font-semibold text-ink/80"
                    >
                      {j + 1}
                    </span>
                    <span className="font-body text-lg leading-relaxed text-ink/85 text-pretty">
                      {l}
                    </span>
                  </li>
                ))}
              </ol>

              <p className="mt-7 rounded-[14px] bg-surface px-5 py-4 font-body leading-relaxed text-ink/85">
                <span className="font-body text-[0.62rem] uppercase tracking-label text-ink/70">
                  Hasilnya
                </span>
                <br />
                {b.hasil}
              </p>

              {b.catatan && (
                <p className="mt-4 border-t border-brick/40 pt-4 font-body leading-relaxed text-ink/75 text-pretty">
                  {b.catatan}
                </p>
              )}
            </section>
          ))}
        </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
