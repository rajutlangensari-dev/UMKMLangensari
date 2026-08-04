// Baris keterangan di bawah sorotan.
//
// Referensi yang diberikan PIC memasang "Free Shipping / Secure Payment /
// Easy Returns / 24/7 Support" di posisi ini. Tidak satu pun benar untuk situs
// ini: tidak ada sistem pengiriman, tidak ada pembayaran di situs, tidak ada
// kebijakan retur, tidak ada layanan pelanggan. Menyalinnya berarti menjanjikan
// hal yang tidak bisa ditepati kepada pembeli desa. Diganti keterangan yang
// memang benar.
//
// DUA DARI EMPAT SEKARANG ANGKA SUNGGUHAN.
//
// Empat kalimat sifat berturut-turut ("usaha warga sendiri", "pesan langsung")
// meminta pengunjung mempercayai sesuatu tanpa memberinya alasan. Angka yang
// dihitung dari isi portal itu sendiri melakukan hal yang berbeda: ia bisa
// diperiksa. "12 usaha" langsung terbantah kalau daftarnya cuma berisi tiga.
//
// Angkanya datang dari data yang SUDAH diambil beranda, jadi bagian ini tidak
// menambah satu pun permintaan ke Apps Script.

import type { Produk } from '@/lib/types';

const KALIMAT = [
  {
    judul: 'Hubungi secara langsung',
    teks: 'Hubungi pembuat melalui WhatsApp untuk menanyakan ketersediaan dan cara pemesanan.',
  },
  {
    judul: 'Kenali pembuatnya',
    teks: 'Setiap produk mencantumkan nama pembuat dan lokasi usaha jika tersedia.',
  },
];

export default function Fakta({
  produk = [],
  jumlahUsaha,
}: {
  produk?: Produk[];
  /** Seluruh UMKM aktif, bukan jumlah slide sorotan yang dibatasi lima. */
  jumlahUsaha?: number;
}) {
  // Kalau salah satu pembacaan backend gagal, hanya angka yang gagal itu yang
  // tidak dirender — bukan dirender sebagai nol. Jumlah usaha tidak boleh
  // memakai `sorotan.length`: slider memang sengaja dibatasi lima, sedangkan
  // kartu ini menerangkan seluruh isi portal.
  // "0 usaha" di halaman muka lebih buruk daripada tidak ada angka sama sekali:
  // yang pertama menyatakan portal ini kosong, yang kedua cuma diam.
  const butir = [
    ...(typeof jumlahUsaha === 'number' && jumlahUsaha > 0
      ? [
          {
            judul: `${jumlahUsaha} usaha warga`,
            teks: 'Setiap usaha dalam portal ini dikelola oleh warga Desa Langensari.',
            angka: true,
          },
        ]
      : []),
    ...(produk.length > 0
      ? [
          {
            judul: `${produk.length} produk`,
            teks: 'Setiap halaman produk mencantumkan harga dan nama pembuat.',
            angka: true,
          },
        ]
      : []),
    ...KALIMAT.map((k) => ({ ...k, angka: false })),
  ];

  return (
    <section className="sembul mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <ul
        className={`grid gap-4 sm:gap-5 ${
          butir.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'
        }`}
      >
        {butir.map((f) => (
          <li
            key={f.judul}
            className="kartu-hover rounded-kartu border border-line bg-paper p-5 sm:p-6"
          >
            <h2
              className={`kartu-hover-judul font-display font-semibold text-ink ${
                // `angka-rata` cuma pada yang berangka: lebar digit tetap menjaga
                // deretannya sejajar, tapi memaksakannya pada teks biasa membuat
                // hurufnya renggang tanpa alasan.
                f.angka ? 'angka-rata text-xl sm:text-2xl' : 'text-sm'
              }`}
            >
              {f.judul}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted text-pretty">
              {f.teks}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
