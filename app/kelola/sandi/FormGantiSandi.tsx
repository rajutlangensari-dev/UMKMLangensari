'use client';

import { useState } from 'react';

const MIN = 10;

export default function FormGantiSandi() {
  const [sandiLama, setSandiLama] = useState('');
  const [sandiBaru, setSandiBaru] = useState('');
  const [ulangi, setUlangi] = useState('');
  const [lihat, setLihat] = useState(false);
  const [galat, setGalat] = useState('');
  const [pesan, setPesan] = useState('');
  const [kirim, setKirim] = useState(false);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setGalat('');
    setPesan('');

    // Diperiksa di sini supaya pemakainya tahu sebelum menunggu jaringan.
    // Pemeriksaan yang sebenarnya berlaku tetap ada di server — yang di sini
    // hanya kenyamanan, bukan penjagaan.
    if (sandiBaru.length < MIN) {
      setGalat(`Kata sandi baru minimal ${MIN} karakter.`);
      return;
    }
    if (sandiBaru !== ulangi) {
      setGalat('Ulangan kata sandi tidak sama.');
      return;
    }

    setKirim(true);
    try {
      const res = await fetch('/api/akun', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aksi: 'gantiSandi', sandiLama, sandiBaru }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      setPesan('Kata sandi berhasil diganti.');
      setSandiLama('');
      setSandiBaru('');
      setUlangi('');
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
    } finally {
      setKirim(false);
    }
  }

  const inputCls =
    'w-full rounded-kartu border border-line bg-surface px-4 py-2.5 font-body text-ink focus:border-aksen focus:outline-none';

  return (
    <div className="mt-8 max-w-md">
      <form onSubmit={simpan} className="space-y-5">
        <label className="block">
          <span className="font-body text-sm text-muted">Kata sandi sekarang</span>
          <input
            type={lihat ? 'text' : 'password'}
            autoComplete="current-password"
            className={`${inputCls} mt-1.5`}
            value={sandiLama}
            onChange={(e) => setSandiLama(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="font-body text-sm text-muted">Kata sandi baru</span>
          <input
            type={lihat ? 'text' : 'password'}
            autoComplete="new-password"
            className={`${inputCls} mt-1.5`}
            value={sandiBaru}
            onChange={(e) => setSandiBaru(e.target.value)}
            required
          />
          <span className="mt-1 block font-body text-xs text-muted">Minimal {MIN} karakter.</span>
        </label>

        <label className="block">
          <span className="font-body text-sm text-muted">Ulangi kata sandi baru</span>
          <input
            type={lihat ? 'text' : 'password'}
            autoComplete="new-password"
            className={`${inputCls} mt-1.5`}
            value={ulangi}
            onChange={(e) => setUlangi(e.target.value)}
            required
          />
        </label>

        <label className="flex items-center gap-2 font-body text-sm text-muted">
          <input type="checkbox" checked={lihat} onChange={(e) => setLihat(e.target.checked)} />
          Tampilkan kata sandi
        </label>

        {galat && (
          <p role="alert" className="font-body text-sm text-ink">
            {galat}
          </p>
        )}
        {pesan && (
          <p role="status" className="font-body text-sm text-ink">
            {pesan}
          </p>
        )}

        <button
          type="submit"
          disabled={kirim}
          className="tekan rounded-full bg-aksen px-7 py-3 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:opacity-60"
        >
          {kirim ? 'Menyimpan...' : 'Ganti kata sandi'}
        </button>
      </form>

      {/* Batasan yang diketahui, ditulis terbuka daripada didiamkan.
          Sesi memakai cookie bertanda tangan tanpa penyimpanan di server, jadi
          mencabut sesi lain butuh satu panggilan ke Apps Script pada SETIAP
          permintaan halaman. Untuk portal sepuluhan akun, biaya kuota dan
          lambatnya tidak sepadan dengan risikonya. Kalau suatu saat perlu:
          simpan nomor versi sandi di baris akun, ikutkan di token, dan periksa
          di jalur tulis saja. */}
      <p className="mt-8 border-t border-line pt-5 font-body text-sm leading-relaxed text-muted">
        Perangkat lain yang sedang masuk dengan akun ini tidak ikut keluar
        otomatis. Sesinya berakhir sendiri paling lama tujuh hari. Kalau kata
        sandi Anda dipakai orang lain, minta super admin menonaktifkan akun ini
        lalu mengaktifkannya kembali.
      </p>
    </div>
  );
}
