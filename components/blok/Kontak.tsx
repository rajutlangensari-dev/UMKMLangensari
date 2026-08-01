import type { BlokKontak } from '@/lib/blok';
import { tautanWhatsapp } from '@/lib/api';
import { Bagian, JudulBagian } from './Blok';
import type { KonteksBlok } from './Blok';

/**
 * Cara memesan.
 *
 * Alamat ditulis apa adanya, TANPA peta tertanam. Peta pihak ketiga berarti
 * skrip pihak ketiga dan kuki pelacak ikut termuat di halaman yang dibuka
 * warga, demi keuntungan yang bisa dicapai satu tautan biasa.
 *
 * Tanpa nomor WA tombolnya tidak dirender sama sekali. Tombol mati mengajak
 * orang menekannya lalu tidak terjadi apa-apa, dan itu terbaca sebagai situs
 * rusak, bukan sebagai keterangan bahwa nomornya belum ada.
 */
export default function Kontak({ blok, konteks }: { blok: BlokKontak; konteks: KonteksBlok }) {
  // Penjagaan "kosong atau tidak" ada di `adaIsi()` dan dijalankan RenderBlok.
  const { umkm } = konteks;

  return (
    <Bagian
      lebar="max-w-3xl"
      anak={
        <div className="rounded-kartu border border-line bg-surface p-7 text-center sm:p-10">
          <JudulBagian>{blok.judul || `Hubungi ${umkm.nama}`}</JudulBagian>

          <dl className="mt-6 space-y-4">
            {umkm.alamat && (
              <div>
                <dt className="font-body text-xs uppercase tracking-label text-muted">Alamat</dt>
                <dd className="mt-1 font-body leading-relaxed text-ink text-pretty">{umkm.alamat}</dd>
              </div>
            )}
            {blok.jamBuka && (
              <div>
                <dt className="font-body text-xs uppercase tracking-label text-muted">Jam buka</dt>
                <dd className="mt-1 font-body leading-relaxed text-ink whitespace-pre-line">
                  {blok.jamBuka}
                </dd>
              </div>
            )}
          </dl>

          {umkm.kontakWa && (
            <a
              href={tautanWhatsapp(umkm.kontakWa, `produk ${umkm.nama}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="tekan mt-8 inline-block rounded-full bg-aksen px-8 py-3 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
            >
              Tanya lewat WhatsApp
            </a>
          )}
        </div>
      }
    />
  );
}
