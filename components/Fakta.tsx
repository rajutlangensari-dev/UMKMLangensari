// Baris keterangan di bawah hero, menggantikan Keunggulan.tsx.
//
// Referensi yang diberikan PIC memasang "Free Shipping / Secure Payment /
// Easy Returns / 24/7 Support" di posisi ini. Tidak satu pun benar untuk situs
// ini: tidak ada sistem pengiriman, tidak ada pembayaran di situs, tidak ada
// kebijakan retur, tidak ada layanan pelanggan. Menyalinnya berarti menjanjikan
// hal yang tidak bisa ditepati kepada pembeli desa. Diganti keterangan yang
// memang benar.
const FAKTA = [
  { judul: 'Dibuat dengan tangan', teks: 'Perajin merajut tiap produk dari rumah masing-masing.' },
  { judul: 'Pesan langsung', teks: 'Hubungi perajin yang mengerjakan produk pilihan Anda.' },
  { judul: 'Kenali perajinnya', teks: 'Anda dapat melihat nama perajin dan kampung asal produk.' },
  { judul: 'Tanya sebelum memesan', teks: 'Tanyakan stok dan detail produk lewat WhatsApp.' },
];

export default function Fakta() {
  return (
    <section className="sembul mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {FAKTA.map((f) => (
          <li key={f.judul} className="border-t border-line pt-4">
            <h2 className="font-display text-sm font-semibold text-ink">{f.judul}</h2>
            <p className="mt-1.5 font-body text-sm leading-relaxed text-muted">{f.teks}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
