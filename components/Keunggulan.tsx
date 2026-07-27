// Pita olive dengan tiga keterangan yang dipisah garis rambut, bukan tiga kartu
// sama besar. Tanpa kotak, jaraknya sendiri yang mengelompokkan.
const ITEM = [
  { judul: 'Dikerjakan dengan tangan', teks: 'Perajin membuat setiap produk satu per satu dari rumah.' },
  { judul: 'Kenali pembuatnya', teks: 'Nama perajin dan asal produk tercantum di halaman produk.' },
  { judul: 'Pesan langsung', teks: 'Hubungi pembuat melalui WhatsApp untuk menanyakan stok atau memesan.' },
];

export default function Keunggulan() {
  return (
    <section className="bg-olive">
      <div className="mx-auto grid max-w-7xl gap-px bg-olive-ink/15 px-0 sm:grid-cols-3">
        {ITEM.map((it) => (
          <div key={it.judul} className="bg-olive px-6 py-10 sm:px-8 sm:py-14">
            <h3 className="font-display text-xl font-extrabold tracking-[-0.01em] text-olive-ink sm:text-2xl">
              {it.judul}
            </h3>
            <p className="mt-2.5 max-w-[38ch] font-body text-sm leading-relaxed text-olive-ink/80">
              {it.teks}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
