import Link from 'next/link';
import type { Produk } from '@/lib/types';
import { normalisasiFotoUrl } from '@/lib/api';

// Rel kategori: satu lingkaran per kategori yang benar-benar ada di data, diisi
// foto produk asli dari kategori itu. Foto nyata, bukan ikon gambar tangan, dan
// tiap lingkaran membawa filter katalog lewat query string sehingga tautannya
// bisa dibagikan.
export default function RailKategori({ produk }: { produk: Produk[] }) {
  const kategori = ringkasKategori(produk);
  if (kategori.length < 2) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="grid gap-8 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:items-end md:gap-12">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">
            Pilih kategori
          </h2>
          <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-ink/70">
            Pilih kategori untuk membuka daftar produknya.
          </p>
        </div>

        {/* Gulir mendatar di layar kecil supaya lingkaran tidak mengecil sampai
            fotonya sulit dibaca. Di desktop, rel merapat ke sisi kanan. */}
        <ul className="flex min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto pb-3 sm:flex-wrap sm:overflow-visible md:justify-end">
          {kategori.map((k) => (
            <li key={k.nama} className="w-[7.5rem] shrink-0 snap-start sm:w-[8.5rem]">
              <Link href={`/katalog?kategori=${encodeURIComponent(k.nama)}`} className="group block">
                <div className="overflow-hidden rounded-full bg-surface ring-1 ring-ink/10 transition-transform duration-300 group-hover:-translate-y-1">
                  {k.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={k.foto}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center">
                      <span className="font-display text-3xl font-extrabold text-ink/25">
                        {k.nama.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center font-body text-[0.68rem] uppercase tracking-label text-ink/70 transition-colors group-hover:text-brick">
                  {k.nama}
                </p>
                <p className="mt-1 text-center font-body text-[0.68rem] text-ink/65">
                  {k.jumlah} produk
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ringkasKategori(produk: Produk[]) {
  const peta = new Map<string, { nama: string; jumlah: number; foto: string }>();
  for (const p of produk) {
    if (!p.kategori) continue;
    const ada = peta.get(p.kategori);
    if (ada) {
      ada.jumlah += 1;
      if (!ada.foto && p.foto) ada.foto = normalisasiFotoUrl(p.foto, 340);
    } else {
      peta.set(p.kategori, {
        nama: p.kategori,
        jumlah: 1,
        // Lingkaran rel maksimal 8,5rem, jadi 340 px sudah cukup untuk retina.
        foto: p.foto ? normalisasiFotoUrl(p.foto, 340) : '',
      });
    }
  }
  return Array.from(peta.values()).sort((a, b) => b.jumlah - a.jumlah);
}
