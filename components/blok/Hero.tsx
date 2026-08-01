import type { BlokHero } from '@/lib/blok';
import { normalisasiFotoUrl } from '@/lib/api';
import type { KonteksBlok } from './Blok';

/**
 * Bagian paling atas halaman usaha.
 *
 * Tiga bentuk menurut tata letak. Bedanya bukan hiasan: usaha yang jualannya
 * banyak ingin orang cepat sampai ke barangnya (ringkas), perajin ingin
 * karyanya dilihat dulu (besar berfoto), dan usaha yang menjual riwayatnya
 * ingin kalimatnya dibaca (naratif).
 *
 * Teks selalu di atas lapisan gelap kalau ada foto. Foto UMKM datang dari HP
 * warga — terang, gelap, ramai, tidak bisa diatur — jadi keterbacaan tidak
 * boleh bergantung pada foto yang kebetulan cocok.
 */
export default function Hero({ blok, konteks }: { blok: BlokHero; konteks: KonteksBlok }) {
  const { tataLetak, umkm } = konteks;
  const besar = tataLetak === 'portofolio';
  const foto = normalisasiFotoUrl(blok.foto || umkm.foto, 1600);
  const judul = blok.judul || umkm.nama;
  const sasaran = blok.sasaranTombol || '#produk';

  if (besar && foto) {
    return (
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/55 to-black/35" />
        <div className="mx-auto flex min-h-[62vh] max-w-6xl flex-col justify-end px-5 py-16 sm:px-8 sm:py-24">
          <h1 className="naik max-w-3xl font-display text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
            {judul}
          </h1>
          {blok.subJudul && (
            <p
              className="naik mt-4 max-w-xl font-body leading-relaxed text-white/85 text-pretty sm:text-lg"
              style={{ animationDelay: '60ms' }}
            >
              {blok.subJudul}
            </p>
          )}
          {blok.teksTombol && (
            <div className="naik mt-8" style={{ animationDelay: '120ms' }}>
              <a
                href={sasaran}
                className="tekan inline-block rounded-full bg-aksen px-7 py-3 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
              >
                {blok.teksTombol}
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Tata letak toko dan cerita.
  //
  // FOTO PROFIL SENGAJA TIDAK DIULANG DI SINI. Header sudah menampilkannya
  // beberapa piksel di atas; menampilkannya lagi membuat halaman dibuka dengan
  // dua salinan wajah yang sama dan tidak ada barang yang terlihat. Foto baru
  // dipakai besar kalau pemiliknya memang memasang foto SAMPUL tersendiri
  // (`blok.foto`), yang perannya memang berbeda dari foto profil.
  const naratif = tataLetak === 'cerita';
  const sampul = blok.foto ? normalisasiFotoUrl(blok.foto, 1400) : '';

  return (
    <section className={`mx-auto ${naratif ? 'max-w-3xl' : 'max-w-6xl'} px-5 pt-10 sm:px-8 sm:pt-14`}>
      {sampul && (
        <div className="naik mb-8 overflow-hidden rounded-kartu bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sampul} alt="" className="aspect-[16/7] w-full object-cover" />
        </div>
      )}

      <div className={naratif ? 'text-center' : 'flex flex-wrap items-end justify-between gap-6'}>
        <div className={naratif ? '' : 'max-w-2xl'}>
          <h1 className="naik font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
            {judul}
          </h1>
          {blok.subJudul && (
            <p
              className="naik mt-4 font-body leading-relaxed text-muted text-pretty sm:text-lg"
              style={{ animationDelay: '60ms' }}
            >
              {blok.subJudul}
            </p>
          )}
        </div>
        {blok.teksTombol && (
          <div className={`naik ${naratif ? 'mt-8' : 'shrink-0'}`} style={{ animationDelay: '120ms' }}>
            <a
              href={sasaran}
              className="tekan inline-flex min-h-11 items-center rounded-full bg-aksen px-7 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
            >
              {blok.teksTombol}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
