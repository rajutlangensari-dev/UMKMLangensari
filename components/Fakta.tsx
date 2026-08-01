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

import type { Produk, SorotanUsaha } from '@/lib/types';

const KALIMAT = [
  {
    judul: 'Pesan langsung',
    teks: 'Hubungi pembuat produk pilihan Anda lewat WhatsApp, tanpa perantara.',
  },
  {
    judul: 'Kenali pembuatnya',
    teks: 'Setiap produk mencantumkan nama usaha dan kampung asalnya.',
  },
];

export default function Fakta({
  produk = [],
  sorotan = [],
}: {
  produk?: Produk[];
  sorotan?: SorotanUsaha[];
}) {
  // Kalau backend gagal, angkanya tidak dirender — bukan dirender sebagai nol.
  // "0 usaha" di halaman muka lebih buruk daripada tidak ada angka sama sekali:
  // yang pertama menyatakan portal ini kosong, yang kedua cuma diam.
  const punyaAngka = produk.length > 0 && sorotan.length > 0;

  const butir = [
    ...(punyaAngka
      ? [
          {
            judul: `${sorotan.length} usaha warga`,
            teks: 'Semuanya dijalankan warga Desa Langensari dari rumahnya sendiri.',
            angka: true,
          },
          {
            judul: `${produk.length} produk`,
            teks: 'Lengkap dengan harga dan nomor yang bisa langsung dihubungi.',
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
