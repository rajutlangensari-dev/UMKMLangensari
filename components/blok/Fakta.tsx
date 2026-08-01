import type { BlokFakta } from '@/lib/blok';
import { Bagian } from './Blok';

/**
 * Angka yang membuat orang percaya: lama berdiri, jumlah perajin, dan sejenisnya.
 *
 * Angkanya memakai tabular-nums lewat kelas `angka-rata`. Tanpa itu, dua angka
 * bersebelahan dengan lebar digit berbeda tidak sejajar, dan deretan yang tidak
 * sejajar terbaca sebagai kurang rapi tanpa orang tahu sebabnya.
 */
export default function Fakta({ blok }: { blok: BlokFakta }) {
  // Penjagaan "kosong atau tidak" ada di `adaIsi()` dan dijalankan RenderBlok;
  // saringan di sini membuang butir kosong di antara yang terisi.
  const butir = blok.butir.filter((b) => b.angka.trim() || b.label.trim());

  return (
    <Bagian
      rapat
      anak={
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-kartu border border-line bg-line sm:grid-cols-4">
          {butir.map((b, i) => (
            <div key={i} className="bg-surface px-5 py-7 text-center">
              <dt className="sr-only">{b.label}</dt>
              <dd>
                <span className="angka-rata block font-display text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl">
                  {b.angka}
                </span>
                <span className="mt-1.5 block font-body text-xs leading-snug text-muted">
                  {b.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      }
    />
  );
}
