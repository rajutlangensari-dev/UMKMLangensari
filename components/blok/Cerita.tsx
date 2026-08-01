import type { BlokCerita } from '@/lib/blok';
import { keParagraf } from '@/lib/blok';
import { normalisasiFotoUrl } from '@/lib/api';
import { Bagian, JudulBagian } from './Blok';

/**
 * Narasi tentang usahanya.
 *
 * Paragraf dipecah dari BARIS KOSONG, bukan dari tag. Isi blok datang dari sel
 * spreadsheet yang bisa diketik siapa pun yang punya aksesnya; kalau di sini
 * merender HTML, satu sel berisi <script> jadi masalah semua orang.
 */
export default function Cerita({ blok }: { blok: BlokCerita }) {
  // Penjagaan "kosong atau tidak" ada di `adaIsi()` dan dijalankan RenderBlok,
  // supaya nav dan halaman memakai aturan yang sama persis.
  const paragraf = keParagraf(blok.teks);
  const foto = normalisasiFotoUrl(blok.foto, 900);
  const kanan = blok.posisiFoto === 'kanan';

  return (
    <Bagian
      lebar={foto ? 'max-w-6xl' : 'max-w-3xl'}
      anak={
        <div className={foto ? 'grid items-center gap-8 sm:gap-12 lg:grid-cols-2' : ''}>
          {foto && (
            <div className={`overflow-hidden rounded-kartu bg-surface ${kanan ? 'lg:order-2' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
          <div>
            {blok.judul && <JudulBagian>{blok.judul}</JudulBagian>}
            <div className={blok.judul ? 'mt-5 space-y-4' : 'space-y-4'}>
              {paragraf.map((p, i) => (
                <p key={i} className="font-body leading-relaxed text-muted text-pretty whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
