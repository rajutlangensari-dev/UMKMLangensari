import { normalisasiFotoUrl } from '@/lib/api';

// Dua kolom lurus di panel lembut. Mosaik asimetris dengan rasio foto berbeda
// dibuang; di HP mosaik itu tetap menumpuk jadi satu kolom, jadi kerumitannya
// hanya terasa di layar besar dan tidak menambah apa pun.
export default function Cerita({ foto = [] }: { foto?: string[] }) {
  const gambar = foto.filter(Boolean).map((f) => normalisasiFotoUrl(f, 900))[0];

  return (
    <section className="sembul mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid items-center gap-8 rounded-[20px] bg-surface px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-2 md:gap-12 md:px-14">
        <div>
          <h2 className="font-display text-xl font-bold leading-snug tracking-[-0.01em] text-ink text-balance sm:text-2xl">
            Perajin Langensari merajut dari rumah
          </h2>
          <div className="mt-4 max-w-prose space-y-3 font-body leading-relaxed text-muted text-pretty">
            <p>
              Perajin di Kampung Cibayawak dan Cipaku mengerjakan pesanan dari rumah
              masing-masing. Mereka menyesuaikan waktu pengerjaan dengan ukuran dan
              detail rajutan.
            </p>
            <p>
              Pesanan datang dari tetangga sekitar dan pembeli di luar desa. Bagi perajin,
              hasil merajut menjadi tambahan penghasilan keluarga.
            </p>
          </div>
        </div>

        {gambar ? (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gambar}
              alt="Hasil rajutan perajin Desa Langensari"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-[14px] bg-paper object-cover"
            />
          </figure>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-[14px] bg-paper px-6 text-center">
            <p className="font-body text-muted">Rajutan warga Desa Langensari.</p>
          </div>
        )}
      </div>
    </section>
  );
}
