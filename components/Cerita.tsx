import { normalisasiFotoUrl } from '@/lib/api';

// Mosaik asimetris: foto utama, cerita, dan foto pendamping memakai lebar berbeda.
// Di HP, teks dibaca dulu lalu foto disusun ringkas di bawahnya.
export default function Cerita({ foto = [] }: { foto?: string[] }) {
  // Panggil eksplisit, bukan `.map(normalisasiFotoUrl)`: map mengirim indeks
  // sebagai argumen kedua, dan argumen kedua fungsi itu adalah lebar gambar.
  const gambar = foto.filter(Boolean).slice(0, 2).map((f) => normalisasiFotoUrl(f, 900));
  const punyaDuaGambar = gambar.length > 1;

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-4 sm:px-8 sm:pb-24 sm:pt-8">
      <h2 className="max-w-2xl font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.02em] text-ink text-balance sm:text-4xl lg:text-5xl">
        Usaha rajut dari Cibayawak dan Cipaku
      </h2>

      <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end md:gap-8 lg:gap-12">
        <div
          className={`order-1 space-y-4 font-body leading-relaxed text-ink/75 text-pretty md:order-2 md:self-center ${
            punyaDuaGambar ? 'md:col-span-4' : 'md:col-span-7'
          }`}
        >
          <p>
            Di Kampung Cibayawak dan Kampung Cipaku, keterampilan merajut tumbuh
            menjadi usaha rumahan. Para perajin mengerjakan produknya dengan tangan
            dari rumah masing-masing.
          </p>
          <p>
            Katalog ini membantu pembeli mengenal pembuat setiap produk. Pembeli
            dapat langsung memesan melalui WhatsApp.
          </p>
        </div>

        {gambar.length > 0 ? (
          <>
            <figure className="label-tenun order-2 md:order-1 md:col-span-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gambar[0]}
                  alt="Produk rajut buatan perajin Desa Langensari"
                loading="lazy"
                className="aspect-[4/5] w-full rounded-[14px] object-cover"
              />
            </figure>

            {gambar[1] && (
              <figure className="label-tenun order-3 md:col-span-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gambar[1]}
                  alt="Detail produk rajut dari Desa Langensari"
                  loading="lazy"
                  className="aspect-square w-full rounded-[14px] object-cover"
                />
              </figure>
            )}
          </>
        ) : (
          <div className="label-tenun order-2 flex aspect-[4/5] items-center justify-center p-8 text-center md:order-1 md:col-span-5">
            <p className="font-display text-xl font-bold leading-tight text-ink/60">
              Karya perajin Desa Langensari.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
