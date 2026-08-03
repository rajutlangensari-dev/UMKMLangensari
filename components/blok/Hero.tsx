import type { BlokHero } from '@/lib/blok';
import { normalisasiFotoUrl } from '@/lib/api';
import type { KonteksBlok } from './Blok';

/** Sampul profil dengan tiga komposisi yang benar-benar berbeda. */
export default function Hero({ blok, konteks }: { blok: BlokHero; konteks: KonteksBlok }) {
  const { tataLetak, umkm } = konteks;
  const fotoProfil = normalisasiFotoUrl(umkm.foto, 560);
  const sampul = normalisasiFotoUrl(blok.foto, 1600);
  // Nama dan keterangan SELALU dari Profil usaha, tidak pernah dari blok.
  // Penyunting halaman mengunci kedua field ini dan mengarahkan pemilik ke
  // halaman Profil kalau mau mengubahnya. Satu sumber, nol desinkronisasi.
  const judul = umkm.nama;
  const subJudul = umkm.bio?.trim().split(/\n/)[0] || '';
  const sasaran = blok.sasaranTombol || '#produk';

  if (tataLetak === 'portofolio') {
    const visual = sampul || fotoProfil;
    return (
      <section className="hero-portofolio relative isolate overflow-hidden bg-surface">
        {visual ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={visual} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 -z-20 bg-aksen/15" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
        <div className={`mx-auto flex max-w-6xl flex-col justify-end px-5 pb-12 pt-28 sm:px-8 sm:pb-16 ${
          visual ? 'min-h-[clamp(30rem,66vh,46rem)]' : 'min-h-96'
        }`}>
          <div className="naik flex max-w-4xl items-end gap-4 sm:gap-6">
            {sampul && fotoProfil && (
              <FotoProfil foto={fotoProfil} nama={umkm.nama} className="h-20 w-20 border-4 border-white sm:h-28 sm:w-28" />
            )}
            <div className="min-w-0 pb-1">
              <p className="mb-3 font-body text-xs font-semibold uppercase tracking-label text-white/75">
                Profil usaha
              </p>
              <h1 className="font-display text-3xl font-bold leading-[1.06] tracking-[-0.035em] text-white text-balance sm:text-5xl lg:text-6xl">
                {judul}
              </h1>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-5 pl-0 sm:gap-7">
            {subJudul && (
              <p className="naik max-w-2xl font-body leading-relaxed text-white/85 text-pretty sm:text-lg" style={{ animationDelay: '60ms' }}>
                {subJudul}
              </p>
            )}
            {blok.teksTombol && (
              <a
                href={sasaran}
                className="tekan naik inline-flex min-h-11 shrink-0 items-center rounded-full bg-aksen px-7 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
                style={{ animationDelay: '120ms' }}
              >
                {blok.teksTombol}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (tataLetak === 'cerita') {
    const visual = sampul || fotoProfil;
    return (
      <section className="hero-cerita mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className={`overflow-hidden rounded-kartu border border-line bg-surface ${visual ? 'grid lg:grid-cols-[1.08fr_.92fr]' : ''}`}>
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
            <p className="naik font-body text-xs font-semibold uppercase tracking-label text-aksen">
              Cerita usaha
            </p>
            <h1 className="naik mt-4 max-w-3xl font-display text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-ink text-balance sm:text-5xl" style={{ animationDelay: '40ms' }}>
              {judul}
            </h1>
            {subJudul && (
              <p className="naik mt-5 max-w-2xl font-body leading-relaxed text-muted text-pretty sm:text-lg" style={{ animationDelay: '80ms' }}>
                {subJudul}
              </p>
            )}
            {blok.teksTombol && (
              <div className="naik mt-8" style={{ animationDelay: '120ms' }}>
                <a
                  href={sasaran}
                  className="tekan inline-flex min-h-11 items-center rounded-full bg-aksen px-7 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
                >
                  {blok.teksTombol}
                </a>
              </div>
            )}
          </div>
          {visual && (
            <div className="relative min-h-72 overflow-hidden bg-aksen/10 lg:min-h-[34rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={visual} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>
    );
  }

  // Preset toko: sampul ringkas dengan kartu identitas yang menumpuk di atasnya.
  // Saat sampul belum diisi, bidang warna tetap memberi struktur tanpa membuat
  // foto profil kecil dipaksa menjadi panorama.
  return (
    <section className="hero-toko mx-auto max-w-6xl px-5 pb-6 pt-8 sm:px-8 sm:pb-10 sm:pt-10">
      <div className="naik overflow-hidden rounded-kartu border border-line bg-surface">
        <div className="relative h-32 overflow-hidden bg-aksen/10 sm:h-48">
          {sampul && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sampul} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="relative mx-4 -mt-10 mb-4 rounded-kartu border border-line bg-paper px-5 pb-6 pt-14 sm:mx-8 sm:-mt-12 sm:mb-8 sm:px-8 sm:pb-8 sm:pt-16">
          <FotoProfil
            foto={fotoProfil}
            nama={umkm.nama}
            className="absolute -top-10 left-5 h-20 w-20 border-4 border-paper sm:-top-12 sm:left-8 sm:h-24 sm:w-24"
          />
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <p className="font-body text-xs font-semibold uppercase tracking-label text-aksen">Toko warga</p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-ink text-balance sm:text-5xl">
                {judul}
              </h1>
              {subJudul && (
                <p className="mt-4 max-w-2xl font-body leading-relaxed text-muted text-pretty sm:text-lg">
                  {subJudul}
                </p>
              )}
            </div>
            {blok.teksTombol && (
              <a
                href={sasaran}
                className="tekan inline-flex min-h-11 shrink-0 items-center rounded-full bg-aksen px-7 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
              >
                {blok.teksTombol}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FotoProfil({ foto, nama, className }: { foto: string; nama: string; className: string }) {
  return (
    <span className={`block shrink-0 overflow-hidden rounded-full bg-surface ${className}`}>
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt={`Foto profil ${nama}`} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-aksen font-display text-2xl font-bold text-aksen-ink">
          {nama.charAt(0) || '?'}
        </span>
      )}
    </span>
  );
}
