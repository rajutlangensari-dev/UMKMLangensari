'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ambilProfil, normalisasiFotoUrl, tautanWhatsapp } from '@/lib/api';
import type { Profil } from '@/lib/types';

export default function HalamanTentang() {
  const [profil, setProfil] = useState<Profil | null | undefined>(undefined);

  useEffect(() => {
    ambilProfil()
      .then(setProfil)
      .catch(() => setProfil(null));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{isi()}</main>
      <Footer />
    </>
  );

  function isi() {
    if (profil === undefined) {
      return (
        <div className="bg-olive px-5 py-20 sm:px-8" aria-busy="true" aria-live="polite">
          <span className="sr-only">Memuat profil</span>
          <div className="mx-auto h-32 w-32 rounded-full bg-olive-ink/15" />
          <div className="mx-auto mt-6 h-8 w-56 rounded-full bg-olive-ink/15" />
        </div>
      );
    }

    const p = profil ?? { namaToko: '', bio: '', foto: '', kontakWa: '', alamat: '' };
    const foto = normalisasiFotoUrl(p.foto, 260);
    const nama = p.namaToko || 'Rajut Langensari';
    const bio =
      p.bio ||
      'Rajut Langensari menampilkan karya perajin rumahan dari Kampung Cibayawak dan Kampung Cipaku. Harga dan nomor WhatsApp pembuat tersedia pada setiap produk.';

    return (
      <>
        {/* Kepala halaman diletakkan di blok olive lalu ditutup gelombang, jadi
            bentuknya berbeda dari halaman katalog dan detail produk. */}
        <section className="bg-olive px-5 pb-16 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20">
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-olive-ink/15 ring-4 ring-olive-ink/25">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={foto} alt={nama} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-4xl font-extrabold text-olive-ink/70">
                {nama.charAt(0)}
              </div>
            )}
          </div>

          <h1 className="mt-7 font-display text-3xl font-extrabold leading-tight tracking-[-0.02em] text-olive-ink sm:text-4xl">
            {nama}
          </h1>
          {p.alamat && (
            <p className="mt-2 font-body text-[0.68rem] uppercase tracking-label text-olive-ink/80">
              {p.alamat}
            </p>
          )}
        </section>

        <div className="gelombang" aria-hidden="true" />

        <section className="mx-auto max-w-2xl px-5 py-14 text-center sm:px-8 sm:py-20">
          <p className="font-body text-lg leading-relaxed text-ink/80 text-pretty">{bio}</p>

          {p.kontakWa && (
            <a
              href={tautanWhatsapp(p.kontakWa, 'produk rajut')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-block rounded-full bg-brick px-8 py-4 font-body text-[0.7rem] font-semibold uppercase tracking-label text-brick-ink transition-colors hover:bg-brick-strong active:translate-y-px"
            >
              Hubungi melalui WhatsApp
            </a>
          )}
        </section>
      </>
    );
  }
}
