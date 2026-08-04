'use client';

import { useState } from 'react';

/**
 * Ganti nama pengguna sendiri.
 *
 * Nama bawaan hasil pendaftaran massal berbentuk `umkm-langensari-17`, dan itu
 * yang harus diketik pemiliknya tiap kali masuk. Menyerahkan penggantiannya ke
 * Korwil berarti tiap orang yang lupa harus menghubungi satu orang yang sama.
 *
 * Setelah berhasil, sesinya SENGAJA dibuang oleh server dan halamannya dimuat
 * ulang ke `/masuk`. Token sesi menyimpan nama pengguna lama, dan jalur ganti
 * sandi mencari akun berdasarkan nama itu — sesi yang dibiarkan hidup akan
 * membuat pemiliknya ditolak di panelnya sendiri tanpa sebab yang kelihatan.
 */
export default function FormNamaPengguna({ sekarang }: { sekarang: string }) {
  const [baru, setBaru] = useState('');
  const [sandi, setSandi] = useState('');
  const [galat, setGalat] = useState('');
  const [kirim, setKirim] = useState(false);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setGalat('');
    setKirim(true);
    try {
      const res = await fetch('/api/akun', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aksi: 'gantiNamaPengguna', namaPengguna: baru, sandi }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      // Muat ulang penuh, bukan router.push: cookie sudah dibuang di respons.
      window.location.href = '/masuk';
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
      setKirim(false);
    }
  }

  const inputCls =
    'min-h-12 w-full rounded-kartu border border-line bg-surface px-4 py-2.5 font-body text-base text-ink focus:border-aksen focus:outline-none sm:min-h-11';

  return (
    <div className="mt-10 max-w-md border-t border-line pt-8">
      <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-lg">
        Nama pengguna
      </h2>
      <p className="mt-1.5 font-body text-base leading-relaxed text-muted sm:text-sm">
        Nama pengguna saat ini <strong className="font-semibold text-ink">{sekarang}</strong>.
        Ubah apabila sulit diingat. Nama usaha tetap dapat digunakan untuk masuk.
      </p>

      <form onSubmit={simpan} className="mt-5 space-y-5">
        <label className="block">
          <span className="font-body text-base text-muted sm:text-sm">Nama pengguna baru</span>
          <input
            type="text"
            autoCapitalize="none"
            autoComplete="off"
            value={baru}
            onChange={(e) => setBaru(e.target.value.toLowerCase())}
            required
            placeholder="contoh: dapursae"
            className={`mt-1.5 ${inputCls}`}
          />
          <span className="mt-1.5 block font-body text-sm text-muted sm:text-xs">
            Minimal 3 karakter, hanya huruf kecil, angka, titik, dan strip.
          </span>
        </label>

        <label className="block">
          <span className="font-body text-base text-muted sm:text-sm">Kata sandi sekarang</span>
          <input
            type="password"
            autoComplete="current-password"
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
            required
            className={`mt-1.5 ${inputCls}`}
          />
        </label>

        {galat && (
          <p role="alert" className="font-body text-base text-ink sm:text-sm">
            {galat}
          </p>
        )}

        <p className="font-body text-sm leading-relaxed text-muted sm:text-xs">
          Setelah perubahan disimpan, Anda perlu masuk kembali menggunakan nama pengguna baru.
        </p>

        <button
          type="submit"
          disabled={kirim}
          className="tekan min-h-12 w-full rounded-full border border-line px-6 font-body text-base font-semibold text-ink transition-[transform,border-color] duration-150 ease-out hover:border-aksen disabled:opacity-60 sm:min-h-11 sm:w-auto sm:text-sm"
        >
          {kirim ? 'Menyimpan...' : 'Ganti nama pengguna'}
        </button>
      </form>
    </div>
  );
}
