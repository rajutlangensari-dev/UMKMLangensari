'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FormMasuk() {
  const [namaPengguna, setNamaPengguna] = useState('');
  const [sandi, setSandi] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [galat, setGalat] = useState('');
  const [kirim, setKirim] = useState(false);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    setGalat('');
    setKirim(true);
    try {
      const res = await fetch('/api/masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaPengguna, sandi }),
      });
      const json = await res.json();
      if (!res.ok) {
        setGalat(json.error || 'Tidak bisa masuk.');
        setKirim(false);
        return;
      }
      // Tujuan awal disimpan saat gerbang mengalihkan ke sini, jadi setelah masuk
      // pengguna kembali ke halaman yang tadi dituju, bukan selalu ke beranda panel.
      const tujuan = new URLSearchParams(window.location.search).get('tujuan');
      window.location.href = tujuan && tujuan.startsWith('/kelola') ? tujuan : '/kelola';
    } catch {
      setGalat('Sambungan bermasalah. Coba lagi.');
      setKirim(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-5 py-16">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">Masuk</h1>

        <form onSubmit={masuk} className="mt-8 space-y-5">
          <label className="block">
            <span className="font-body text-sm text-ink">Nama pengguna</span>
            <input
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              value={namaPengguna}
              onChange={(e) => setNamaPengguna(e.target.value)}
              required
              className="mt-1.5 w-full rounded-kartu border border-line bg-surface px-4 py-3 font-body text-ink placeholder:text-muted focus:border-aksen focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-body text-sm text-ink">Kata sandi</span>
            <div className="relative mt-1.5">
              <input
                type={lihatSandi ? 'text' : 'password'}
                autoComplete="current-password"
                value={sandi}
                onChange={(e) => setSandi(e.target.value)}
                required
                className="w-full rounded-kartu border border-line bg-surface px-4 py-3 pr-20 font-body text-ink focus:border-aksen focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setLihatSandi((v) => !v)}
                className="tekan absolute inset-y-0 right-0 px-4 font-body text-xs text-muted transition-colors hover:text-ink"
              >
                {lihatSandi ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </label>

          {/* Galat tampil di halaman, bukan sebagai alert(). Alert menutupi
              formulir dan hilang begitu ditutup, jadi orang lupa apa yang salah. */}
          {galat && (
            <p role="alert" className="font-body text-sm text-ink">
              {galat}
            </p>
          )}

          <button
            type="submit"
            disabled={kirim}
            className="tekan w-full rounded-full bg-aksen py-3 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:opacity-60"
          >
            {kirim ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
