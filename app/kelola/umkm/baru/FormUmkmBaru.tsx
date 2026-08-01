'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TATA_LETAK_BAWAAN, TEMA_BAWAAN, type TataLetak, type Tema } from '@/lib/blok';
import { PilihTataLetak, PilihTema } from '../../profil/FormProfilUmkm';

interface Hasil {
  umkm: { nama: string; slug: string };
  namaPengguna: string;
  sandi: string;
}

/** Ubah nama usaha jadi slug, sama seperti yang dilakukan backend. */
function keSlug(teks: string) {
  return teks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function FormUmkmBaru() {
  const [nama, setNama] = useState('');
  const [slugManual, setSlugManual] = useState('');
  const [bio, setBio] = useState('');
  const [kontakWa, setKontakWa] = useState('');
  const [alamat, setAlamat] = useState('');
  const [namaPenggunaManual, setNamaPenggunaManual] = useState('');
  const [tema, setTema] = useState<Tema>(TEMA_BAWAAN);
  const [tataLetak, setTataLetak] = useState<TataLetak>(TATA_LETAK_BAWAAN);
  const [galat, setGalat] = useState('');
  const [kirim, setKirim] = useState(false);
  const [hasil, setHasil] = useState<Hasil | null>(null);

  // Slug dan nama pengguna diusulkan dari nama usaha, tapi tetap bisa disunting.
  // Mengetik dua kali hal yang hampir selalu sama adalah cara paling mudah
  // membuat salah ketik.
  const slug = slugManual || keSlug(nama);
  const namaPengguna = namaPenggunaManual || keSlug(nama).split('-')[0];

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setGalat('');
    setKirim(true);
    try {
      const res = await fetch('/api/umkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, slug, bio, kontakWa, alamat, namaPengguna, tema, tataLetak }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      setHasil(json);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
      setKirim(false);
    }
  }

  const inputCls =
    'w-full rounded-kartu border border-line bg-surface px-4 py-2.5 font-body text-ink placeholder:text-muted focus:border-aksen focus:outline-none';

  // Kata sandi hanya ada di layar ini, sekali. Tidak disimpan di mana pun dan
  // tidak bisa ditampilkan ulang — kalau hilang, super admin menyetel ulang.
  if (hasil) {
    return (
      <div className="mt-8 rounded-kartu border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold text-ink">
          {hasil.umkm.nama} sudah terdaftar
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-muted">
          Halamannya sudah hidup di{' '}
          <Link href={`/umkm/${hasil.umkm.slug}`} className="warna-interaktif underline underline-offset-4">
            /umkm/{hasil.umkm.slug}
          </Link>
          . Serahkan dua baris di bawah ke pemiliknya.
        </p>

        <dl className="mt-6 space-y-3 rounded-kartu border border-line bg-paper p-5">
          <div>
            <dt className="font-body text-xs text-muted">Nama pengguna</dt>
            <dd className="font-display text-lg font-semibold text-ink">{hasil.namaPengguna}</dd>
          </div>
          <div>
            <dt className="font-body text-xs text-muted">Kata sandi awal</dt>
            <dd className="font-display text-lg font-semibold tracking-wider text-ink">
              {hasil.sandi}
            </dd>
          </div>
        </dl>

        <p className="mt-4 font-body text-sm leading-relaxed text-ink">
          Catat sekarang. Kata sandi ini tidak disimpan dan tidak bisa dilihat lagi
          setelah halaman ini ditutup.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/kelola"
            className="tekan rounded-full bg-aksen px-6 py-2.5 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
          >
            Selesai
          </Link>
          <button
            type="button"
            onClick={() => {
              setHasil(null);
              setKirim(false);
              setNama('');
              setSlugManual('');
              setBio('');
              setKontakWa('');
              setAlamat('');
              setNamaPenggunaManual('');
            }}
            className="tekan rounded-full border border-line px-6 py-2.5 font-body text-sm text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink"
          >
            Daftarkan satu lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={simpan} className="mt-8 space-y-5">
      <label className="block">
        <span className="font-body text-sm text-muted">Nama usaha</span>
        <input
          className={`${inputCls} mt-1.5`}
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="font-body text-sm text-muted">Alamat halaman</span>
        <input
          className={`${inputCls} mt-1.5`}
          value={slug}
          onChange={(e) => setSlugManual(keSlug(e.target.value))}
          placeholder="otomatis dari nama usaha"
        />
        <span className="mt-1 block font-body text-xs text-muted">
          Halamannya jadi /umkm/{slug || '...'}. Tidak bisa diubah setelah dibuat,
          karena tautan yang sudah tersebar akan mati.
        </span>
      </label>

      <label className="block">
        <span className="font-body text-sm text-muted">Nomor WhatsApp</span>
        <input
          className={`${inputCls} mt-1.5`}
          value={kontakWa}
          onChange={(e) => setKontakWa(e.target.value)}
          placeholder="08xx atau 62xx"
        />
      </label>

      <label className="block">
        <span className="font-body text-sm text-muted">Alamat</span>
        <input
          className={`${inputCls} mt-1.5`}
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Kp. ... RT ... RW ..."
        />
      </label>

      <label className="block">
        <span className="font-body text-sm text-muted">Keterangan usaha</span>
        <textarea
          className={`${inputCls} mt-1.5 min-h-24`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Apa yang dijual dan bagaimana cara memesannya."
        />
      </label>

      <label className="block">
        <span className="font-body text-sm text-muted">Nama pengguna pemilik</span>
        <input
          className={`${inputCls} mt-1.5`}
          value={namaPengguna}
          onChange={(e) => setNamaPenggunaManual(e.target.value.trim())}
          placeholder="otomatis dari nama usaha"
        />
        <span className="mt-1 block font-body text-xs text-muted">
          Dipakai pemiliknya untuk masuk. Kata sandi dibuatkan sistem dan
          ditampilkan sekali setelah disimpan.
        </span>
      </label>

      {/* Tema dan bentuk halaman dipilih SEKARANG, bukan nanti, karena keduanya
          menentukan susunan blok bawaan yang langsung dibuatkan. Halamannya jadi
          layak dibagikan sebelum pemiliknya pernah masuk sekali pun. */}
      <PilihTataLetak nilai={tataLetak} onPilih={setTataLetak} />
      <PilihTema nilai={tema} onPilih={setTema} />

      {galat && (
        <p role="alert" className="font-body text-sm text-ink">
          {galat}
        </p>
      )}

      <button
        type="submit"
        disabled={kirim || !nama.trim()}
        className="tekan rounded-full bg-aksen px-7 py-3 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:opacity-60"
      >
        {kirim ? 'Menyimpan...' : 'Daftarkan usaha'}
      </button>
    </form>
  );
}
