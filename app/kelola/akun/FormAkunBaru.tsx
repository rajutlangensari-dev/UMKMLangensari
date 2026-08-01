'use client';

import { useState } from 'react';
import type { Umkm } from '@/lib/types';

/** Buat akun untuk usaha yang sudah terdaftar, atau super admin tambahan. */
export default function FormAkunBaru({
  daftarUmkm,
  onBatal,
  onSelesai,
}: {
  daftarUmkm: Umkm[];
  onBatal: () => void;
  onSelesai: (nama: string, sandi: string) => void;
}) {
  const [peran, setPeran] = useState<'umkm' | 'admin'>('umkm');
  const [umkmId, setUmkmId] = useState('');
  const [namaPengguna, setNamaPengguna] = useState('');
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState('');

  // Diusulkan dari nama usahanya. Mengetik dua kali hal yang hampir selalu sama
  // adalah cara paling mudah membuat salah ketik.
  const usaha = daftarUmkm.find((u) => u.id === umkmId);
  const usul =
    peran === 'umkm' && usaha
      ? usaha.slug.split('-')[0]
      : '';

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setGalat('');
    setKirim(true);
    try {
      const res = await fetch('/api/akun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaPengguna: namaPengguna || usul,
          peran,
          umkmId: peran === 'umkm' ? umkmId : '',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Akun tidak dapat dibuat.');
      onSelesai(json.namaPengguna, json.sandi);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
      setKirim(false);
    }
  }

  const inputCls =
    'mt-1.5 w-full min-h-11 rounded-kartu border border-line bg-paper px-4 py-2.5 font-body text-sm text-ink placeholder:text-muted focus:border-aksen focus:outline-none';

  return (
    <form onSubmit={simpan} className="rounded-kartu border border-line bg-surface p-5 sm:p-6">
      <h3 className="font-display text-base font-bold text-ink">Tambah akun</h3>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-body text-sm text-muted">Jenis akun</span>
          <select
            className={inputCls}
            value={peran}
            onChange={(e) => setPeran(e.target.value === 'admin' ? 'admin' : 'umkm')}
          >
            <option value="umkm">Pemilik usaha — hanya mengurus satu usaha</option>
            <option value="admin">Super admin — bisa mengurus seluruh portal</option>
          </select>
        </label>

        {peran === 'umkm' && (
          <label className="block">
            <span className="font-body text-sm text-muted">Usaha</span>
            <select className={inputCls} value={umkmId} onChange={(e) => setUmkmId(e.target.value)}>
              <option value="">Pilih usaha...</option>
              {daftarUmkm.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                  {u.status === 'nonaktif' ? ' (nonaktif)' : ''}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block sm:col-span-2">
          <span className="font-body text-sm text-muted">Nama pengguna</span>
          <input
            className={inputCls}
            value={namaPengguna}
            onChange={(e) => setNamaPengguna(e.target.value.trim().toLowerCase())}
            placeholder={usul || 'huruf kecil, tanpa spasi'}
          />
          <span className="mt-1 block font-body text-xs text-muted">
            Dipakai untuk masuk. Kata sandi dibuatkan sistem dan ditampilkan sekali setelah
            disimpan.
          </span>
        </label>
      </div>

      {peran === 'admin' && (
        <p className="mt-4 rounded-kartu border border-line bg-paper p-4 font-body text-sm leading-relaxed text-ink text-pretty">
          Super admin bisa melihat dan mengubah seluruh usaha, produk, dan akun di portal
          ini — termasuk menonaktifkan akun lain. Berikan hanya ke orang yang memang
          mengelola portal.
        </p>
      )}

      {galat && (
        <p role="alert" className="mt-4 font-body text-sm text-ink">
          {galat}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={kirim || (peran === 'umkm' && !umkmId) || !(namaPengguna || usul)}
          className="tekan flex min-h-11 items-center rounded-full bg-aksen px-6 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:opacity-50"
        >
          {kirim ? 'Membuat...' : 'Buat akun'}
        </button>
        <button
          type="button"
          onClick={onBatal}
          className="tekan flex min-h-11 items-center rounded-full border border-line px-6 font-body text-sm text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
