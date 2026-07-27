'use client';

import { useEffect, useState } from 'react';
import type { Profil } from '@/lib/types';
import { ambilProfil, simpanProfil, uploadFoto } from '@/lib/api';

const KOSONG: Profil = { namaToko: '', bio: '', foto: '', kontakWa: '', alamat: '' };

// Edit profil toko (halaman Tentang), mirip mengedit profil Instagram:
// foto, nama, bio, alamat, kontak. Disimpan ke sheet Profil lewat backend.
export default function FormProfil({ token, onSelesai }: { token: string; onSelesai: () => void }) {
  const [form, setForm] = useState<Profil>(KOSONG);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ambilProfil()
      .then((p) => setForm(p))
      .catch(() => {})
      .finally(() => setMemuat(false));
  }, []);

  function ubah<K extends keyof Profil>(field: K, nilai: Profil[K]) {
    setForm((f) => ({ ...f, [field]: nilai }));
  }

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMengunggah(true);
    setError('');
    try {
      ubah('foto', await uploadFoto(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setMengunggah(false);
      e.target.value = '';
    }
  }

  async function simpan() {
    setMenyimpan(true);
    setError('');
    try {
      await simpanProfil(token, form);
      onSelesai();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setMenyimpan(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-ink/15 bg-bg px-4 py-2.5 font-body text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none';

  if (memuat) {
    return (
      <div className="rounded-2xl border border-ink/12 bg-surface p-8">
        <p className="font-body text-ink/65">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/12 bg-surface p-6 sm:p-8">
      <h2 className="font-display text-3xl font-semibold text-ink">Profil toko</h2>
      <p className="mt-1 font-body text-sm text-ink/65">
        Informasi ini ditampilkan di halaman Tentang.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-bg">
          {form.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.foto} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-2xl italic text-ink/40">
              ?
            </div>
          )}
        </div>
        <label className="cursor-pointer rounded-full border border-ink/20 px-5 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink">
          {mengunggah ? 'Mengunggah...' : form.foto ? 'Ganti foto profil' : 'Pilih foto profil'}
          <input type="file" accept="image/*" className="hidden" disabled={mengunggah} onChange={pilihFoto} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5">
        <Kolom label="Nama toko">
          <input className={inputCls} value={form.namaToko} onChange={(e) => ubah('namaToko', e.target.value)} />
        </Kolom>
        <Kolom label="Alamat">
          <input className={inputCls} value={form.alamat} onChange={(e) => ubah('alamat', e.target.value)} />
        </Kolom>
        <Kolom label="Kontak WhatsApp">
          <input
            className={inputCls}
            placeholder="08xx atau 62xx"
            value={form.kontakWa}
            onChange={(e) => ubah('kontakWa', e.target.value)}
          />
        </Kolom>
        <Kolom label="Deskripsi usaha">
          <textarea
            className={`${inputCls} min-h-32`}
            value={form.bio}
            onChange={(e) => ubah('bio', e.target.value)}
          />
        </Kolom>
      </div>

      {error && <p className="mt-5 font-body text-sm text-accent">{error}</p>}

      <div className="mt-7 flex gap-3">
        <button
          onClick={simpan}
          disabled={menyimpan}
          className="rounded-full bg-accent px-7 py-2.5 font-body font-semibold text-accent-ink transition-colors hover:bg-accent-strong disabled:opacity-50"
        >
          {menyimpan ? 'Menyimpan...' : 'Simpan profil'}
        </button>
        <button
          onClick={onSelesai}
          className="rounded-full border border-ink/20 px-7 py-2.5 font-body text-ink/70 transition-colors hover:border-ink/40"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function Kolom({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 font-body text-sm text-ink/70">
      {label}
      {children}
    </label>
  );
}
