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
      'Katalog bersama perajin rumahan Kampung Cibayawak dan Kampung Cipaku. Setiap produk mencantumkan harga dan nomor WhatsApp pembuatnya.';

    return (
      <section className="mx-auto max-w-2xl px-5 py-12 text-center sm:px-8 sm:py-16">
        <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-surface">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={nama} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-muted/50">
              {nama.charAt(0)}
            </div>
          )}
        </div>

        <h1 className="mt-6 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
          {nama}
        </h1>
        {p.alamat && <p className="mt-1.5 font-body text-sm text-muted">{p.alamat}</p>}

        <p className="mt-6 font-body leading-relaxed text-muted text-pretty">{bio}</p>

        {p.kontakWa && (
          <a
            href={tautanWhatsapp(p.kontakWa, 'produk rajut')}
            target="_blank"
            rel="noopener noreferrer"
            className="tekan mt-8 inline-block rounded-full bg-olive px-7 py-3 font-body text-sm font-semibold text-olive-ink transition-[transform,background-color] duration-150 ease-out hover:bg-olive-strong"
          >
            Hubungi melalui WhatsApp
          </a>
        )}
      </section>
    );
  }
}
