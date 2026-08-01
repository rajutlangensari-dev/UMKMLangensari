'use client';

import { useState } from 'react';
import type { Produk, Umkm } from '@/lib/types';
import { lupakanFoto, uploadFoto } from '@/lib/api';

type Isian = Omit<Produk, 'id'>;

const KOSONG: Isian = {
  namaProduk: '',
  kategori: '',
  harga: 0,
  stok: 'Tersedia',
  deskripsi: '',
  foto: '',
  kontakWa: '',
  namaUmkm: '',
  umkmId: '',
  alamat: '',
  status: 'Aktif',
};

/**
 * Formulir produk untuk panel /kelola.
 *
 * Kolom pokok — foto, nama, harga, stok, kategori, deskripsi — selalu terlihat.
 * Nama pembuat, kontak WA, alamat, status, dan URL foto masuk "Rincian lain"
 * yang tertutup secara bawaan.
 *
 * Kenapa disembunyikan tapi tidak dibuang: keempatnya hampir selalu sama dengan
 * profil usahanya, jadi mengetiknya ulang tiap produk adalah pekerjaan yang
 * hasilnya sudah diketahui. Tapi tetap ada kasus nyata yang butuh — satu
 * perajin menitipkan barang lewat usaha lain, atau nomor WA produk tertentu
 * memang beda. Menghilangkan kolomnya berarti kasus itu mentok tanpa jalan
 * keluar.
 *
 * Bagian terlipat TERBUKA SENDIRI kalau salah satu isinya berbeda dari profil
 * usaha. Nilai yang sudah ditimpa tidak boleh tersembunyi di balik panel
 * tertutup; orang akan menyimpulkan produknya memakai nomor usaha padahal tidak.
 *
 * Kata sandi tidak ikut ke mana-mana: yang menulis adalah `/api/produk`, dan
 * yang membuktikan identitas adalah cookie sesi.
 */
export default function FormProduk({
  produkAwal,
  daftarUmkm,
  umkmTerkunci,
  onBatal,
  onTersimpan,
}: {
  produkAwal: Produk | null;
  /** Diisi hanya untuk super admin. Kosong berarti pemiliknya sudah pasti. */
  daftarUmkm: Umkm[];
  /** id UMKM milik sesi, untuk peran umkm. */
  umkmTerkunci?: string;
  onBatal: () => void;
  onTersimpan: (nama: string) => void;
}) {
  const [form, setForm] = useState<Isian>(() => {
    if (produkAwal) return produkAwal;
    return { ...KOSONG, umkmId: umkmTerkunci || '' };
  });
  // Harga disimpan sebagai TEKS selama diketik, bukan number. Kalau memakai
  // number, mengosongkan kotak menghasilkan NaN atau lompat balik ke 0, dan
  // pemisah ribuan tidak bisa ditampilkan sambil diketik.
  const [hargaTeks, setHargaTeks] = useState(() =>
    produkAwal && produkAwal.harga > 0 ? produkAwal.harga.toLocaleString('id-ID') : ''
  );
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState('');

  const bolehPilihUmkm = daftarUmkm.length > 0;
  const usaha = daftarUmkm.find((u) => u.id === form.umkmId);

  // Terbuka sendiri kalau ada yang menyimpang dari profil usahanya, atau kalau
  // produknya sudah nonaktif — keduanya keadaan yang harus terlihat, bukan
  // tersembunyi di balik ringkasan.
  const [rincianDibuka] = useState(() => {
    if (!produkAwal) return false;
    if (produkAwal.status.toLowerCase() !== 'aktif') return true;
    const u = daftarUmkm.find((x) => x.id === produkAwal.umkmId);
    if (!u) return false;
    const menyimpang = (nilai: string, asal: string) => Boolean(nilai) && nilai !== asal;
    return (
      menyimpang(produkAwal.kontakWa, u.kontakWa) ||
      menyimpang(produkAwal.alamat, u.alamat) ||
      menyimpang(produkAwal.namaUmkm, u.nama)
    );
  });

  function ubah<K extends keyof Isian>(field: K, nilai: Isian[K]) {
    setForm((f) => ({ ...f, [field]: nilai }));
  }

  // Memilih UMKM sekaligus mengisi kontak dan alamat, karena hampir selalu sama
  // dengan milik usahanya. Tetap bisa ditimpa untuk produk yang ditangani orang
  // berbeda. Yang sudah diisi tidak ditimpa.
  function pilihUmkm(id: string) {
    const u = daftarUmkm.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      umkmId: id,
      namaUmkm: f.namaUmkm || u?.nama || '',
      kontakWa: f.kontakWa || u?.kontakWa || '',
      alamat: f.alamat || u?.alamat || '',
    }));
  }

  function ketikHarga(teks: string) {
    // Cuma angka yang disimpan; titik, spasi, dan "Rp" yang ikut tertempel saat
    // menyalin dari tempat lain dibuang tanpa mengganggu yang mengetiknya.
    const bersih = teks.replace(/[^\d]/g, '');
    setHargaTeks(bersih ? Number(bersih).toLocaleString('id-ID') : '');
    ubah('harga', bersih ? Number(bersih) : 0);
  }

  // Foto yang sudah tersimpan di sheet untuk produk ini. Apa pun yang berbeda
  // dari nilai ini berarti hasil unggahan sesi ini yang BELUM tercatat di mana
  // pun — kalau ditinggalkan, tidak akan pernah ada pembandingan lama-vs-baru
  // yang menemukannya.
  const fotoTersimpan = produkAwal?.foto ?? '';

  /** Lepas foto yang belum tersimpan. Yang sudah tersimpan diurus backend. */
  function lepasFotoBelumTersimpan(url: string) {
    if (url && url !== fotoTersimpan) lupakanFoto(url);
  }

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMengunggah(true);
    setError('');
    try {
      const baru = await uploadFoto(file);
      // Yang digantikan dilepas SETELAH unggahan baru berhasil. Kalau dilepas
      // lebih dulu lalu unggahannya gagal, orangnya kehilangan foto yang tadi
      // masih ada di layarnya.
      lepasFotoBelumTersimpan(form.foto);
      ubah('foto', baru);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setMengunggah(false);
      e.target.value = '';
    }
  }

  function batal() {
    lepasFotoBelumTersimpan(form.foto);
    onBatal();
  }

  async function simpan() {
    if (!form.namaProduk.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }
    if (bolehPilihUmkm && !form.umkmId) {
      setError('Pilih dulu usaha pemilik produk ini.');
      return;
    }
    if (!form.harga) {
      setError('Isi dulu harganya. Kalau harganya berubah-ubah, tulis harga terendah.');
      return;
    }
    setMenyimpan(true);
    setError('');
    try {
      const res = await fetch(
        produkAwal ? `/api/produk/${produkAwal.id}` : '/api/produk',
        {
          method: produkAwal ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      onTersimpan(form.namaProduk);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setMenyimpan(false);
    }
  }

  const inputCls =
    'w-full min-h-11 rounded-kartu border border-line bg-paper px-4 py-2.5 font-body text-ink placeholder:text-muted focus:border-aksen focus:outline-none';

  const ringkasRincian = usaha
    ? `Kontak & alamat: ikut ${usaha.nama}`
    : 'Kontak, alamat, nama pembuat, dan status';

  return (
    <div className="rounded-kartu border border-line bg-surface p-5 sm:p-8">
      <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
        {produkAwal ? 'Ubah produk' : 'Tambah produk'}
      </h2>

      {bolehPilihUmkm && (
        <div className="mt-6">
          <Kolom label="Usaha pemilik produk">
            <select className={inputCls} value={form.umkmId} onChange={(e) => pilihUmkm(e.target.value)}>
              <option value="">Pilih usaha...</option>
              {daftarUmkm.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                  {u.status === 'nonaktif' ? ' (nonaktif)' : ''}
                </option>
              ))}
            </select>
          </Kolom>
        </div>
      )}

      {/* ---------- Foto: paling atas, paling besar ---------- */}
      <div className="mt-6">
        <span className="font-body text-sm text-muted">Foto produk</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-4">
          {form.foto ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.foto} alt="" className="h-28 w-28 rounded-kartu object-cover" />
              <button
                type="button"
                onClick={() => {
                  lepasFotoBelumTersimpan(form.foto);
                  ubah('foto', '');
                }}
                aria-label="Buang foto"
                className="tekan absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper text-muted transition-colors hover:text-ink"
              >
                <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3 w-3">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="tekan flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-kartu border border-dashed border-line bg-paper text-muted transition-colors hover:border-aksen hover:text-ink">
              {mengunggah ? (
                <>
                  {/* Penanda kemajuan, bukan cuma tulisan. Unggah foto lewat
                      data seluler desa bisa belasan detik; tanpa gerak, orang
                      menyimpulkan tombolnya tidak tertekan lalu menekan lagi. */}
                  <span className="kilau h-8 w-8 rounded-full" />
                  <span className="font-body text-xs">Mengunggah</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none">
                    <path d="M12 16V6m0 0L8 10m4-4 4 4M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <span className="font-body text-xs">Pilih foto</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={mengunggah}
                onChange={pilihFoto}
              />
            </label>
          )}
          <p className="max-w-[16rem] font-body text-xs leading-relaxed text-muted">
            Foto terang dengan latar polos paling menarik pembeli. Maksimal 5 MB.
          </p>
        </div>
      </div>

      {/* ---------- Kolom pokok ---------- */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Kolom label="Nama produk" lebar>
          <input
            className={inputCls}
            value={form.namaProduk}
            onChange={(e) => ubah('namaProduk', e.target.value)}
          />
        </Kolom>

        <Kolom label="Harga">
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-body text-muted"
            >
              Rp
            </span>
            <input
              className={`${inputCls} angka-rata pl-11`}
              // "numeric" bukan type="number": papan ketik angka tetap muncul di
              // HP, tapi tanpa tombol naik-turun dan tanpa gulir roda tetikus
              // yang diam-diam mengubah nilainya.
              inputMode="numeric"
              placeholder="25.000"
              value={hargaTeks}
              onChange={(e) => ketikHarga(e.target.value)}
            />
          </div>
        </Kolom>

        <Kolom label="Stok">
          <select className={inputCls} value={form.stok} onChange={(e) => ubah('stok', e.target.value)}>
            <option value="Tersedia">Tersedia</option>
            <option value="Habis">Habis</option>
          </select>
        </Kolom>

        <Kolom label="Kategori" lebar>
          <input
            className={inputCls}
            list="daftar-kategori"
            placeholder="Rajut, Konveksi, Olahan Kering, ..."
            value={form.kategori}
            onChange={(e) => ubah('kategori', e.target.value)}
          />
          <datalist id="daftar-kategori">
            <option value="Rajut" />
            <option value="Konveksi" />
            <option value="Olahan Kering" />
            <option value="Buket" />
            <option value="Kerajinan" />
            <option value="Meubel" />
          </datalist>
        </Kolom>

        <Kolom label="Deskripsi" lebar>
          <textarea
            className={`${inputCls} min-h-28`}
            placeholder="Bahan, ukuran, lama pengerjaan, cara merawat."
            value={form.deskripsi}
            onChange={(e) => ubah('deskripsi', e.target.value)}
          />
        </Kolom>
      </div>

      {/* ---------- Rincian lain ---------- */}
      <details open={rincianDibuka} className="mt-6 rounded-kartu border border-line bg-paper">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-body text-sm text-ink">
          <span>
            Rincian lain
            <span className="ml-2 text-muted">{ringkasRincian}</span>
          </span>
          <svg viewBox="0 0 12 8" aria-hidden="true" className="h-2 w-3 shrink-0 text-muted">
            <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </summary>

        <div className="grid grid-cols-1 gap-5 border-t border-line p-4 sm:grid-cols-2">
          <Kolom label="Nama pembuat yang tampil">
            <input
              className={inputCls}
              placeholder={usaha?.nama || 'Nama perajin atau nama usaha'}
              value={form.namaUmkm}
              onChange={(e) => ubah('namaUmkm', e.target.value)}
            />
          </Kolom>

          <Kolom label="Kontak WhatsApp">
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder={usaha?.kontakWa || '08xx atau 62xx'}
              value={form.kontakWa}
              onChange={(e) => ubah('kontakWa', e.target.value)}
            />
          </Kolom>

          <Kolom label="Alamat" lebar>
            <input
              className={inputCls}
              placeholder={usaha?.alamat || 'Kp. ... RT ... RW ...'}
              value={form.alamat}
              onChange={(e) => ubah('alamat', e.target.value)}
            />
          </Kolom>

          <Kolom label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => ubah('status', e.target.value)}>
              <option value="Aktif">Aktif — tampil di katalog</option>
              <option value="Nonaktif">Nonaktif — disembunyikan</option>
            </select>
          </Kolom>

          <Kolom label="URL foto">
            <input
              className={inputCls}
              placeholder="Kalau fotonya sudah ada di internet"
              value={form.foto}
              onChange={(e) => ubah('foto', e.target.value)}
            />
          </Kolom>
        </div>
      </details>

      {error && (
        <p role="alert" className="mt-5 font-body text-sm text-ink">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          onClick={simpan}
          disabled={menyimpan || mengunggah}
          className="tekan flex min-h-11 items-center rounded-full bg-aksen px-7 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:opacity-60"
        >
          {menyimpan ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          onClick={batal}
          className="tekan flex min-h-11 items-center rounded-full border border-line px-7 font-body text-sm text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

function Kolom({
  label,
  lebar,
  children,
}: {
  label: string;
  lebar?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 font-body text-sm text-muted ${lebar ? 'sm:col-span-2' : ''}`}>
      {label}
      {children}
    </label>
  );
}
