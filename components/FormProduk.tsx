'use client';

import { useState } from 'react';
import type { Produk, ProdukBaru } from '@/lib/types';
import { buatProduk, perbaruiProduk, uploadFoto } from '@/lib/api';

const KOSONG: ProdukBaru = {
  namaProduk: '',
  kategori: 'Rajut',
  harga: 0,
  stok: 'Tersedia',
  deskripsi: '',
  foto: '',
  kontakWa: '',
  namaUmkm: '',
  alamat: '',
  status: 'Aktif',
};

export default function FormProduk({
  token,
  produkAwal,
  onBatal,
  onTersimpan,
}: {
  token: string;
  produkAwal: Produk | null;
  onBatal: () => void;
  onTersimpan: () => void;
}) {
  const [form, setForm] = useState<ProdukBaru>(produkAwal ?? KOSONG);
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState('');

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

  function ubah<K extends keyof ProdukBaru>(field: K, nilai: ProdukBaru[K]) {
    setForm((f) => ({ ...f, [field]: nilai }));
  }

  async function simpan() {
    if (!form.namaProduk.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }
    setMenyimpan(true);
    setError('');
    try {
      if (produkAwal) await perbaruiProduk(token, produkAwal.id, form);
      else await buatProduk(token, form);
      onTersimpan();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setMenyimpan(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-ink/15 bg-bg px-4 py-2.5 font-body text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none';

  return (
    <div className="rounded-2xl border border-ink/12 bg-surface p-6 sm:p-8">
      <h2 className="font-display text-3xl font-semibold text-ink">
        {produkAwal ? 'Ubah produk' : 'Tambah produk'}
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Kolom label="Nama produk">
          <input className={inputCls} value={form.namaProduk} onChange={(e) => ubah('namaProduk', e.target.value)} />
        </Kolom>

        <Kolom label="Kategori">
          <input
            className={inputCls}
            list="daftar-kategori"
            value={form.kategori}
            onChange={(e) => ubah('kategori', e.target.value)}
          />
          <datalist id="daftar-kategori">
            <option value="Rajut" />
            <option value="Konveksi" />
            <option value="Olahan Kering" />
          </datalist>
        </Kolom>

        <Kolom label="Harga (Rp)">
          <input
            type="number"
            className={inputCls}
            value={form.harga}
            onChange={(e) => ubah('harga', Number(e.target.value))}
          />
        </Kolom>

        <Kolom label="Stok">
          <input className={inputCls} list="daftar-stok" value={form.stok} onChange={(e) => ubah('stok', e.target.value)} />
          <datalist id="daftar-stok">
            <option value="Tersedia" />
            <option value="Habis" />
          </datalist>
        </Kolom>

        <Kolom label="Nama UMKM atau perajin">
          <input className={inputCls} value={form.namaUmkm} onChange={(e) => ubah('namaUmkm', e.target.value)} />
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

        <Kolom label="Status">
          <select className={inputCls} value={form.status} onChange={(e) => ubah('status', e.target.value)}>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </Kolom>

        <Kolom label="Foto produk" lebar>
          <div className="flex items-center gap-4">
            {form.foto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.foto} alt="" className="h-20 w-20 rounded-xl object-cover" />
            )}
            <label className="cursor-pointer rounded-full border border-ink/20 px-5 py-2.5 font-body text-sm font-semibold text-ink transition-colors hover:border-accent hover:bg-accent hover:text-accent-ink">
              {mengunggah ? 'Mengunggah...' : form.foto ? 'Ganti foto' : 'Pilih foto'}
              <input type="file" accept="image/*" className="hidden" disabled={mengunggah} onChange={pilihFoto} />
            </label>
          </div>
          <input
            className={`${inputCls} mt-3`}
            placeholder="Atau masukkan URL foto"
            value={form.foto}
            onChange={(e) => ubah('foto', e.target.value)}
          />
        </Kolom>

        <Kolom label="Deskripsi" lebar>
          <textarea
            className={`${inputCls} min-h-28`}
            value={form.deskripsi}
            onChange={(e) => ubah('deskripsi', e.target.value)}
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
          {menyimpan ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          onClick={onBatal}
          className="rounded-full border border-ink/20 px-7 py-2.5 font-body text-ink/70 transition-colors hover:border-ink/40"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

function Kolom({ label, lebar, children }: { label: string; lebar?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 font-body text-sm text-ink/70 ${lebar ? 'sm:col-span-2' : ''}`}>
      {label}
      {children}
    </label>
  );
}
