'use client';

import { useRef, useState } from 'react';
import type { Produk, Umkm } from '@/lib/types';
import { lupakanFoto, uploadFoto } from '@/lib/api';

type Isian = Pick<
  Produk,
  'namaProduk' | 'kategori' | 'harga' | 'stok' | 'deskripsi' | 'foto' | 'umkmId' | 'status'
>;

const KOSONG: Isian = {
  namaProduk: '',
  kategori: '',
  harga: 0,
  stok: 'Tersedia',
  deskripsi: '',
  foto: '',
  umkmId: '',
  status: 'Aktif',
};

function isianAwal(produk: Produk | null, umkmId: string): Isian {
  if (!produk) return { ...KOSONG, umkmId };
  return {
    namaProduk: produk.namaProduk,
    kategori: produk.kategori,
    harga: produk.harga,
    stok: produk.stok || 'Tersedia',
    deskripsi: produk.deskripsi,
    foto: produk.foto,
    umkmId: produk.umkmId,
    status: produk.status.toLowerCase() === 'nonaktif' ? 'Nonaktif' : 'Aktif',
  };
}

/**
 * Formulir produk untuk panel /kelola.
 *
 * Identitas penjual tidak diminta ulang di sini. Nama usaha, nomor WhatsApp,
 * dan alamat selalu mengikuti Profil usaha yang terhubung lewat `umkmId`.
 */
export default function FormProduk({
  produkAwal,
  daftarUmkm,
  profilUsaha,
  umkmTerkunci,
  onBatal,
  onTersimpan,
}: {
  produkAwal: Produk | null;
  /** Diisi hanya untuk super admin. Kosong berarti pemiliknya sudah pasti. */
  daftarUmkm: Umkm[];
  /** Profil milik sesi UMKM. Tidak berisi data usaha lain. */
  profilUsaha?: Umkm;
  /** id UMKM milik sesi, untuk peran umkm. */
  umkmTerkunci?: string;
  onBatal: () => void;
  onTersimpan: (nama: string) => void;
}) {
  const [form, setForm] = useState<Isian>(() =>
    isianAwal(produkAwal, umkmTerkunci || '')
  );
  // Harga disimpan sebagai teks selama diketik agar kotak bisa dikosongkan dan
  // pemisah ribuan tetap tampil tanpa mengubah nilai yang sedang ditulis.
  const [hargaTeks, setHargaTeks] = useState(() =>
    produkAwal && produkAwal.harga > 0 ? produkAwal.harga.toLocaleString('id-ID') : ''
  );
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengunggah, setMengunggah] = useState(false);
  const [error, setError] = useState('');

  const pilihUsahaRef = useRef<HTMLSelectElement>(null);
  const namaRef = useRef<HTMLInputElement>(null);
  const hargaRef = useRef<HTMLInputElement>(null);

  const bolehPilihUmkm = daftarUmkm.length > 0;
  const usaha = bolehPilihUmkm
    ? daftarUmkm.find((u) => u.id === form.umkmId)
    : profilUsaha;

  function ubah<K extends keyof Isian>(field: K, nilai: Isian[K]) {
    setForm((f) => ({ ...f, [field]: nilai }));
    if (error) setError('');
  }

  function ketikHarga(teks: string) {
    // Titik, spasi, dan tulisan "Rp" yang ikut tertempel dibuang. Papan ketik
    // angka tetap dipakai melalui `inputMode`, tanpa kontrol naik-turun.
    const bersih = teks.replace(/[^\d]/g, '');
    setHargaTeks(bersih ? Number(bersih).toLocaleString('id-ID') : '');
    ubah('harga', bersih ? Number(bersih) : 0);
  }

  // Foto yang sudah tercatat. Foto lain adalah unggahan sesi ini yang perlu
  // disapu jika pengguna membatalkan formulir.
  const fotoTersimpan = produkAwal?.foto ?? '';

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

  async function simpan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bolehPilihUmkm && !form.umkmId) {
      setError('Pilih usaha pemilik produk terlebih dahulu.');
      pilihUsahaRef.current?.focus();
      return;
    }
    if (!form.namaProduk.trim()) {
      setError('Isi nama produk terlebih dahulu.');
      namaRef.current?.focus();
      return;
    }
    if (!form.harga) {
      setError('Isi harga produk. Jika harganya berubah, tuliskan harga terendah.');
      hargaRef.current?.focus();
      return;
    }

    setMenyimpan(true);
    setError('');
    try {
      const res = await fetch(produkAwal ? `/api/produk/${produkAwal.id}` : '/api/produk', {
        method: produkAwal ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Produk tidak dapat disimpan.');
      onTersimpan(form.namaProduk.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setMenyimpan(false);
    }
  }

  const inputCls =
    'w-full min-h-12 rounded-kartu border border-line bg-paper px-4 py-3 font-body text-base text-ink placeholder:text-muted focus:border-aksen focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

  const petunjukProfil = bolehPilihUmkm
    ? 'Jika perlu diperbarui, buka data usaha tersebut melalui menu Usaha warga.'
    : 'Jika perlu diperbarui, buka menu Profil usaha.';

  return (
    <form
      onSubmit={simpan}
      noValidate
      aria-busy={menyimpan || mengunggah}
      className="rounded-kartu border border-line bg-surface p-5 sm:p-8"
    >
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
          {produkAwal ? 'Ubah produk' : 'Tambah produk'}
        </h2>
        <p className="mt-2 max-w-xl font-body text-base leading-relaxed text-muted">
          Isi bagian yang bertanda wajib. Data penjual akan mengikuti Profil usaha secara otomatis.
        </p>

        {bolehPilihUmkm && (
          <div className="mt-7">
            <Kolom
              id="usaha-pemilik"
              label="Usaha pemilik produk"
              wajib
              petunjuk="Pilih usaha yang akan menampilkan produk ini."
            >
              <select
                ref={pilihUsahaRef}
                id="usaha-pemilik"
                className={inputCls}
                value={form.umkmId}
                onChange={(e) => ubah('umkmId', e.target.value)}
                required
                aria-describedby="usaha-pemilik-petunjuk"
              >
                <option value="">Pilih usaha</option>
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

        <section aria-labelledby="data-penjual" className="mt-7 rounded-kartu border border-line bg-paper p-4 sm:p-5">
          <h3 id="data-penjual" className="font-body text-base font-semibold text-ink">
            Data penjual tidak perlu diisi ulang
          </h3>
          <p className="mt-1 font-body text-sm leading-relaxed text-muted">
            Nama usaha, nomor WhatsApp, dan alamat diambil dari Profil usaha. {petunjukProfil}
          </p>

          {usaha ? (
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <DataProfil label="Nama usaha" nilai={usaha.nama || 'Belum diisi'} />
              <DataProfil label="Nomor WhatsApp" nilai={nomorTampil(usaha.kontakWa) || 'Belum diisi'} />
              <DataProfil label="Alamat" nilai={usaha.alamat || 'Belum diisi'} />
            </dl>
          ) : (
            <p className="mt-3 font-body text-sm font-semibold text-ink">
              Pilih usaha terlebih dahulu untuk memeriksa data penjualnya.
            </p>
          )}

          {usaha && !usaha.kontakWa && (
            <p className="mt-4 border-l-2 border-aksen pl-3 font-body text-sm leading-relaxed text-ink">
              Nomor WhatsApp belum diisi. Lengkapi Profil usaha agar pembeli dapat menghubungi penjual.
            </p>
          )}
        </section>

        <section aria-labelledby="data-produk" className="mt-8">
          <h3 id="data-produk" className="font-display text-lg font-bold text-ink">
            Data produk
          </h3>
          <p className="mt-1 font-body text-sm leading-relaxed text-muted">
            Gunakan informasi yang biasa ditanyakan pembeli.
          </p>

          <fieldset className="mt-6">
            <legend className="font-body text-base font-semibold text-ink">
              Foto produk <span className="font-normal text-muted">(disarankan)</span>
            </legend>
            <div className="mt-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-kartu border border-dashed border-line bg-paper">
                {form.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.foto}
                    alt="Pratinjau foto produk"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-3 text-center font-body text-sm leading-snug text-muted">
                    Belum ada foto
                  </span>
                )}
              </div>

              <div className="max-w-sm">
                <div className="flex flex-wrap gap-2">
                  <label className="tekan flex min-h-12 cursor-pointer items-center rounded-full border border-line bg-paper px-5 font-body text-base font-semibold text-ink transition-[transform,border-color] duration-150 ease-out hover:border-aksen">
                    {mengunggah ? 'Mengunggah foto...' : form.foto ? 'Ganti foto' : 'Pilih foto'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={mengunggah || menyimpan}
                      onChange={pilihFoto}
                    />
                  </label>
                  {form.foto && (
                    <button
                      type="button"
                      onClick={() => {
                        lepasFotoBelumTersimpan(form.foto);
                        ubah('foto', '');
                      }}
                      disabled={mengunggah || menyimpan}
                      className="tekan flex min-h-12 items-center rounded-full px-5 font-body text-base text-muted transition-[transform,color] duration-150 ease-out hover:text-ink disabled:opacity-60"
                    >
                      Hapus foto
                    </button>
                  )}
                </div>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">
                  Gunakan foto yang terang dan menampilkan satu produk. Maksimal 5 MB.
                </p>
                <span className="sr-only" aria-live="polite">
                  {mengunggah ? 'Foto sedang diunggah.' : ''}
                </span>
              </div>
            </div>
          </fieldset>

          <div className="mt-7 space-y-6">
            <Kolom
              id="nama-produk"
              label="Nama produk"
              wajib
              petunjuk="Gunakan nama yang mudah dikenali pembeli. Contoh: Keripik pisang cokelat."
            >
              <input
                ref={namaRef}
                id="nama-produk"
                className={inputCls}
                value={form.namaProduk}
                onChange={(e) => ubah('namaProduk', e.target.value)}
                required
                autoComplete="off"
                aria-describedby="nama-produk-petunjuk"
              />
            </Kolom>

            <Kolom
              id="harga-produk"
              label="Harga"
              wajib
              petunjuk="Tuliskan harga satu produk. Jika harganya berubah, masukkan harga terendah."
            >
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-body text-base text-muted"
                >
                  Rp
                </span>
                <input
                  ref={hargaRef}
                  id="harga-produk"
                  className={`${inputCls} angka-rata pl-12`}
                  inputMode="numeric"
                  placeholder="25.000"
                  value={hargaTeks}
                  onChange={(e) => ketikHarga(e.target.value)}
                  required
                  aria-describedby="harga-produk-petunjuk"
                />
              </div>
            </Kolom>

            <Kolom
              id="kategori-produk"
              label="Kategori"
              petunjuk="Pilih jenis produk agar pembeli lebih mudah menemukannya."
            >
              <input
                id="kategori-produk"
                className={inputCls}
                list="daftar-kategori"
                placeholder="Contoh: Makanan, Minuman, Kerajinan"
                value={form.kategori}
                onChange={(e) => ubah('kategori', e.target.value)}
                aria-describedby="kategori-produk-petunjuk"
              />
              <datalist id="daftar-kategori">
                <option value="Makanan" />
                <option value="Minuman" />
                <option value="Rajut" />
                <option value="Konveksi" />
                <option value="Buket" />
                <option value="Kerajinan" />
                <option value="Meubel" />
              </datalist>
            </Kolom>

            <Kolom
              id="deskripsi-produk"
              label="Keterangan produk"
              petunjuk="Bagian ini opsional. Isi dengan ukuran, rasa, bahan, isi kemasan, atau waktu pemesanan."
            >
              <textarea
                id="deskripsi-produk"
                className={`${inputCls} min-h-32 resize-y`}
                placeholder="Contoh: Satu bungkus berisi 250 gram. Tersedia rasa manis dan pedas."
                value={form.deskripsi}
                onChange={(e) => ubah('deskripsi', e.target.value)}
                aria-describedby="deskripsi-produk-petunjuk"
              />
            </Kolom>
          </div>
        </section>

        <section aria-labelledby="tampilan-produk" className="mt-8 border-t border-line pt-7">
          <h3 id="tampilan-produk" className="font-display text-lg font-bold text-ink">
            Ketersediaan produk
          </h3>
          <div className="mt-5 space-y-6">
            <Kolom
              id="stok-produk"
              label="Apakah produk tersedia?"
              wajib
              petunjuk="Pilih Habis untuk sementara jika stok sedang kosong."
            >
              <select
                id="stok-produk"
                className={inputCls}
                value={form.stok}
                onChange={(e) => ubah('stok', e.target.value)}
                aria-describedby="stok-produk-petunjuk"
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Habis">Habis untuk sementara</option>
              </select>
            </Kolom>

            <Kolom
              id="status-produk"
              label="Tampilkan produk"
              wajib
              petunjuk="Sembunyikan sementara jika data produk belum siap dilihat pembeli."
            >
              <select
                id="status-produk"
                className={inputCls}
                value={form.status}
                onChange={(e) => ubah('status', e.target.value)}
                aria-describedby="status-produk-petunjuk"
              >
                <option value="Aktif">Tampilkan di katalog</option>
                <option value="Nonaktif">Sembunyikan sementara</option>
              </select>
            </Kolom>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-kartu border border-line bg-paper px-4 py-3 font-body text-base leading-relaxed text-ink"
          >
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={batal}
            disabled={menyimpan}
            className="tekan flex min-h-12 items-center justify-center rounded-full border border-line px-7 font-body text-base text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink disabled:opacity-60 sm:w-auto"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={menyimpan || mengunggah}
            className="tekan flex min-h-12 items-center justify-center rounded-full bg-aksen px-7 font-body text-base font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {menyimpan ? 'Menyimpan produk...' : 'Simpan produk'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Kolom({
  id,
  label,
  wajib,
  petunjuk,
  children,
}: {
  id: string;
  label: string;
  wajib?: boolean;
  petunjuk?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-body text-base font-semibold text-ink">
        {label}
        {wajib && <span className="ml-2 font-normal text-muted">(wajib)</span>}
      </label>
      <div className="mt-2">{children}</div>
      {petunjuk && (
        <p id={`${id}-petunjuk`} className="mt-2 font-body text-sm leading-relaxed text-muted">
          {petunjuk}
        </p>
      )}
    </div>
  );
}

function DataProfil({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-body text-xs uppercase tracking-label text-muted">{label}</dt>
      <dd className="mt-1 break-words font-body text-sm leading-relaxed text-ink">{nilai}</dd>
    </div>
  );
}

function nomorTampil(nomor: string): string {
  if (nomor.startsWith('62')) return `0${nomor.slice(2)}`;
  return nomor;
}
