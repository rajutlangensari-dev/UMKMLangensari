import type { BlokGaleri } from '@/lib/blok';
import { normalisasiFotoUrl } from '@/lib/api';
import { Bagian, JudulBagian } from './Blok';

/**
 * Foto hasil kerja atau suasana usahanya.
 *
 * Di layar kecil digulir mendatar dengan scroll-snap; di layar lebar jadi kisi.
 * Yang digulir memakai `<ul>` biasa, jadi Tab tetap berpindah antarfoto dan
 * peramban ikut menggeser kotaknya sendiri — tanpa satu baris JavaScript.
 *
 * `alt` diambil dari keterangannya. Kalau keterangannya kosong, `alt=""` supaya
 * pembaca layar MELEWATI foto itu. Mengisinya dengan "foto galeri" berarti
 * memaksa orang mendengar delapan kali kalimat yang tidak memberi tahu apa pun.
 */
export default function Galeri({ blok }: { blok: BlokGaleri }) {
  // Penjagaan "kosong atau tidak" ada di `adaIsi()` dan dijalankan RenderBlok.
  return (
    <Bagian
      anak={
        <>
          {blok.judul && <JudulBagian>{blok.judul}</JudulBagian>}
          <ul
            className={`${
              blok.judul ? 'mt-8' : ''
            } rel-galeri -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0`}
          >
            {blok.foto.map((f, i) => (
              <li
                key={i}
                className="w-[72vw] shrink-0 sm:w-[42vw] lg:w-auto lg:shrink"
              >
                <figure className="group overflow-hidden rounded-kartu bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={normalisasiFotoUrl(f.url, 800)}
                    alt={f.keterangan || ''}
                    loading="lazy"
                    className="zoom-produk aspect-square w-full object-cover"
                  />
                  {f.keterangan && (
                    <figcaption className="px-3 py-2.5 font-body text-xs leading-snug text-muted">
                      {f.keterangan}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}
