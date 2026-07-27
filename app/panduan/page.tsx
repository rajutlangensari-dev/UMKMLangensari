import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Panduan usaha',
  description:
    'Materi workshop UMKM Desa Langensari: NIB, foto produk, toko online, QRIS, Google Maps, catatan kas, dan modal usaha.',
};

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
        <section className="bg-olive px-5 pb-14 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-olive-ink text-balance sm:text-5xl">
              Panduan usaha untuk UMKM Langensari
            </h1>
            <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-olive-ink/85 text-pretty">
              Semua materi workshop ada di halaman ini. Bisa dibuka kapan saja dari HP. Tidak
              perlu dihafal, tinggal dibaca lagi saat mengerjakan.
            </p>
          </div>
        </section>

        <div className="gelombang" aria-hidden="true" />

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
      </main>

      <Footer />
    </>
  );
}
