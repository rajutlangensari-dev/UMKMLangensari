import type { BlokKeunggulan } from '@/lib/blok';
import { Bagian, JudulBagian } from './Blok';

/** Dua sampai empat hal yang membedakan usaha ini. Butir kosong tidak dirender. */
export default function Keunggulan({ blok }: { blok: BlokKeunggulan }) {
  // Penjagaan "kosong atau tidak" ada di `adaIsi()` dan dijalankan RenderBlok;
  // saringan di sini membuang butir kosong di antara yang terisi.
  const butir = blok.butir.filter((b) => b.judul.trim() || b.teks.trim());

  // Kelas ditulis lengkap, bukan dirangkai dari potongan. Tailwind memindai
  // berkas sebagai teks: kelas yang baru terbentuk saat dijalankan tidak pernah
  // ikut ke CSS keluaran, dan gejalanya adalah tata letak yang diam-diam salah
  // hanya di production.
  const kolom = butir.length >= 4 ? 'lg:grid-cols-4' : butir.length === 3 ? 'lg:grid-cols-3' : '';

  return (
    <Bagian
      anak={
        <>
          {blok.judul && <JudulBagian>{blok.judul}</JudulBagian>}
          <ul className={`${blok.judul ? 'mt-8' : ''} grid gap-5 sm:grid-cols-2 ${kolom}`}>
            {butir.map((b, i) => (
              <li key={i} className="rounded-kartu border border-line bg-surface p-6">
                {/* Angka urut kecil: menandai ini daftar setara, bukan langkah
                    berurutan yang harus dikerjakan satu per satu. */}
                <span aria-hidden="true" className="angka-rata font-display text-sm font-bold text-aksen">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {b.judul && (
                  <h3 className="mt-3 font-display text-base font-semibold text-ink">{b.judul}</h3>
                )}
                {b.teks && (
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted text-pretty">{b.teks}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}
