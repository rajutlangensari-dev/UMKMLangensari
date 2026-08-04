'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { lupakanFoto, lupakanFotoSaatPergi, uploadFoto } from '@/lib/api';
import { useKabar } from '@/components/Pemberitahuan';
import {
  LABEL_TATA_LETAK,
  LABEL_TEMA,
  TATA_LETAK,
  TEMA,
  warnaTemaKustom,
  type TataLetak,
  type Tema,
} from '@/lib/blok';
import type { Umkm } from '@/lib/types';

/**
 * Profil satu usaha, plus pilihan tema dan tata letak halamannya.
 *
 * Satu usaha per formulir. Versi sebelumnya memuat SELURUH UMKM lalu menaruh
 * pemilih di atasnya — artinya data usaha lain ikut terkirim ke browser siapa
 * pun yang membuka halaman ini, dan super admin harus memilih dua kali untuk
 * satu pekerjaan. Sekarang halaman detail yang memilihkan.
 */
export default function FormProfilUmkm({ umkm }: { umkm: Umkm }) {
  const router = useRouter();
  const kabar = useKabar();

  const [form, setForm] = useState({
    nama: umkm.nama,
    bio: umkm.bio,
    foto: umkm.foto,
    kontakWa: umkm.kontakWa,
    alamat: umkm.alamat,
    tema: umkm.tema as Tema,
    tataLetak: umkm.tataLetak as TataLetak,
  });
  const [mengunggah, setMengunggah] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState('');

  function ubah<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Foto yang sudah tersimpan di sheet. Apa pun yang berbeda dari ini adalah
  // hasil unggahan sesi ini yang belum tercatat di mana pun.
  const [fotoTersimpan, setFotoTersimpan] = useState(umkm.foto);

  // Dibaca dari ref, bukan dari state, di dalam efek pembersih. Efeknya cuma
  // dipasang sekali; kalau ia menutup nilai state, yang terbaca saat halaman
  // ditinggalkan adalah nilai dari render pertama, bukan yang terakhir.
  const kini = useRef({ foto: form.foto, tersimpan: fotoTersimpan });
  kini.current = { foto: form.foto, tersimpan: fotoTersimpan };

  // Halaman ini tidak punya tombol Batal — ditinggalkan begitu saja dengan
  // menekan menu lain. Unggahan yang belum sempat disimpan disapu di sini.
  useEffect(() => {
    function pergi() {
      const { foto, tersimpan } = kini.current;
      if (foto && foto !== tersimpan) lupakanFotoSaatPergi([foto]);
    }
    window.addEventListener('beforeunload', pergi);
    return () => {
      window.removeEventListener('beforeunload', pergi);
      // Berpindah halaman di dalam aplikasi tidak memicu `beforeunload`, jadi
      // pembongkaran komponen ini yang menanganinya.
      pergi();
    };
  }, []);

  function lepasFotoBelumTersimpan(url: string) {
    if (url && url !== fotoTersimpan) lupakanFoto(url);
  }

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMengunggah(true);
    setGalat('');
    try {
      const baru = await uploadFoto(file);
      // Dilepas SETELAH unggahan baru berhasil, supaya kegagalan unggah tidak
      // menghilangkan foto yang tadi masih ada di layarnya.
      lepasFotoBelumTersimpan(form.foto);
      ubah('foto', baru);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
    } finally {
      setMengunggah(false);
      e.target.value = '';
    }
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setGalat('');
    setMenyimpan(true);
    try {
      const res = await fetch('/api/umkm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: umkm.id, ...form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      // Sudah tercatat di sheet: mulai sekarang backend yang mengurusnya kalau
      // nanti diganti lagi, dan penjaga "belum tersimpan" tidak boleh
      // menghapusnya saat halaman ditinggalkan.
      setFotoTersimpan(form.foto);
      kabar(`Profil ${form.nama} tersimpan`);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
    } finally {
      setMenyimpan(false);
    }
  }

  const inputCls =
    'w-full min-h-12 rounded-kartu border border-line bg-surface px-4 py-2.5 font-body text-base text-ink placeholder:text-muted focus:border-aksen focus:outline-none sm:min-h-11';

  return (
    <form onSubmit={simpan} className="max-w-2xl space-y-6">
      <div>
        <span className="font-body text-base text-muted sm:text-sm">Foto usaha</span>
        <div className="mt-2 flex items-start gap-4 sm:items-center">
          <span className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface">
            {form.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.foto} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-muted/50">
                {form.nama.charAt(0) || '?'}
              </span>
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label className="tekan flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-line px-4 font-body text-base font-semibold text-ink transition-[transform,border-color] duration-150 ease-out hover:border-aksen sm:min-h-11 sm:px-5 sm:text-sm">
              {mengunggah ? 'Mengunggah...' : form.foto ? 'Ganti foto' : 'Pilih foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={mengunggah}
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
                className="tekan flex min-h-12 items-center justify-center rounded-full border border-line px-4 font-body text-base text-muted transition-colors hover:text-ink sm:min-h-11 sm:border-0 sm:text-sm"
              >
                Buang
              </button>
            )}
          </div>
        </div>
      </div>

      <label className="block">
        <span className="font-body text-base text-muted sm:text-sm">Nama usaha</span>
        <input
          className={`${inputCls} mt-1.5`}
          value={form.nama}
          onChange={(e) => ubah('nama', e.target.value)}
          required
        />
        {/* Slug tidak ikut berubah saat nama diganti — tautan yang sudah tersebar
            di WhatsApp harus tetap hidup. Dijelaskan supaya tidak dikira bug. */}
        <span className="mt-1 block font-body text-sm leading-relaxed text-muted sm:text-xs">
          Alamat halaman tetap /umkm/{umkm.slug} walaupun namanya diganti, supaya tautan
          yang sudah dibagikan tidak mati.
        </span>
      </label>

      <label className="block">
        <span className="font-body text-base text-muted sm:text-sm">Nomor WhatsApp</span>
        <input
          className={`${inputCls} mt-1.5`}
          inputMode="numeric"
          value={form.kontakWa}
          onChange={(e) => ubah('kontakWa', e.target.value)}
          placeholder="08xx atau 62xx"
        />
      </label>

      <label className="block">
        <span className="font-body text-base text-muted sm:text-sm">Alamat</span>
        <input
          className={`${inputCls} mt-1.5`}
          value={form.alamat}
          onChange={(e) => ubah('alamat', e.target.value)}
          placeholder="Kp. ... RT ... RW ..."
        />
      </label>

      <label className="block">
        <span className="font-body text-base text-muted sm:text-sm">Keterangan usaha</span>
        <textarea
          className={`${inputCls} mt-1.5 min-h-28`}
          value={form.bio}
          onChange={(e) => ubah('bio', e.target.value)}
          placeholder="Apa yang dijual dan bagaimana cara memesannya."
        />
      </label>

      <PilihTema nilai={form.tema} onPilih={(t) => ubah('tema', t)} />
      <PilihTataLetak nilai={form.tataLetak} onPilih={(t) => ubah('tataLetak', t)} />

      {galat && (
        <p role="alert" className="font-body text-base sm:text-sm text-ink">
          {galat}
        </p>
      )}

      <button
        type="submit"
        disabled={menyimpan || mengunggah}
        className="tekan flex min-h-12 w-full items-center justify-center rounded-full bg-aksen px-7 font-body text-base font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:opacity-60 sm:min-h-11 sm:w-auto sm:text-sm"
      >
        {menyimpan ? 'Menyimpan...' : 'Simpan profil'}
      </button>
    </form>
  );
}

/**
 * Pemilih tema. Menampilkan CONTOH WARNANYA, bukan cuma namanya — "nila" tidak
 * memberi tahu apa pun sampai warnanya terlihat.
 */
export function PilihTema({ nilai, onPilih }: { nilai: Tema; onPilih: (t: Tema) => void }) {
  const warnaKustom = warnaTemaKustom(nilai);
  const warnaPemilih = warnaKustom || '#6a743e';

  return (
    <fieldset>
      <legend className="font-body text-base text-muted sm:text-sm">Warna halaman</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {TEMA.map((t) => (
          <label
            key={t}
            data-tema={t}
            className={`tekan flex min-h-12 cursor-pointer items-start gap-3 rounded-kartu border p-4 transition-colors sm:p-3 ${
              nilai === t ? 'border-aksen bg-surface' : 'border-line hover:border-aksen'
            }`}
          >
            <input
              type="radio"
              name="tema"
              value={t}
              checked={nilai === t}
              onChange={() => onPilih(t)}
              className="sr-only"
            />
            {/* Bulatan ini mewarisi --aksen dari data-tema di label, jadi ia
                benar-benar warna yang akan dipakai, bukan tiruan yang bisa
                meleset saat temanya diubah. */}
            <span aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-aksen" />
            <span className="min-w-0">
              <span className="block font-body text-base text-ink sm:text-sm">{LABEL_TEMA[t].nama}</span>
              <span className="mt-0.5 block font-body text-sm leading-relaxed text-muted sm:mt-0 sm:text-xs sm:leading-snug">
                {LABEL_TEMA[t].jelas}
              </span>
            </span>
          </label>
        ))}
      </div>
      <label
        className={`mt-2 flex min-h-12 cursor-pointer flex-wrap items-start gap-3 rounded-kartu border p-4 transition-colors sm:flex-nowrap sm:items-center sm:gap-4 sm:p-3 ${
          warnaKustom ? 'border-aksen bg-surface' : 'border-line hover:border-aksen'
        }`}
      >
        <input
          type="color"
          value={warnaPemilih}
          onChange={(e) => onPilih(e.target.value.toLowerCase() as Tema)}
          className="pemilih-warna h-11 w-14 shrink-0 cursor-pointer rounded-[10px] border border-line bg-paper p-1"
          aria-label="Pilih warna khusus"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-body text-base text-ink sm:text-sm">Pilih warna sendiri</span>
          <span className="mt-0.5 block font-body text-sm leading-relaxed text-muted sm:mt-0 sm:text-xs sm:leading-snug">
            Gunakan roda warna. Sistem akan menyesuaikan tingkat gelap dan terang agar teks tetap terbaca.
          </span>
        </span>
        <span className="angka-rata w-full text-right font-body text-sm uppercase text-muted sm:w-auto sm:shrink-0 sm:text-xs">
          {warnaKustom || 'Bebas'}
        </span>
      </label>
    </fieldset>
  );
}

/** Pemilih tata letak. Menyebut sketsa susunannya dan cocok untuk usaha seperti apa. */
export function PilihTataLetak({
  nilai,
  onPilih,
}: {
  nilai: TataLetak;
  onPilih: (t: TataLetak) => void;
}) {
  return (
    <fieldset>
      <legend className="font-body text-base text-muted sm:text-sm">Bentuk halaman</legend>
      <div className="mt-2 space-y-2">
        {TATA_LETAK.map((t) => (
          <label
            key={t}
            className={`tekan flex min-h-12 cursor-pointer flex-col items-start gap-3 rounded-kartu border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:p-3 ${
              nilai === t ? 'border-aksen bg-surface' : 'border-line hover:border-aksen'
            }`}
          >
            <input
              type="radio"
              name="tataLetak"
              value={t}
              checked={nilai === t}
              onChange={() => onPilih(t)}
              className="sr-only"
            />
            <SketsaTataLetak jenis={t} />
            <span className="min-w-0">
              <span className="flex items-center gap-2 font-body text-base text-ink sm:text-sm">
                <span
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 shrink-0 rounded-full border-[3px] ${
                    nilai === t ? 'border-aksen bg-aksen' : 'border-line'
                  }`}
                />
                {LABEL_TATA_LETAK[t].nama}
              </span>
              <span className="mt-0.5 block font-body text-sm leading-relaxed text-muted sm:mt-0 sm:text-xs sm:leading-snug">
                {LABEL_TATA_LETAK[t].jelas}
              </span>
              <span className="mt-1 block font-body text-sm text-muted/80 sm:text-xs">
                {LABEL_TATA_LETAK[t].sketsa}
              </span>
            </span>
          </label>
        ))}
      </div>
      {/* Ditulis terang-terangan: orang tidak akan mencoba pilihan lain kalau
          menduga percobaannya bisa menghapus tulisan yang sudah dibuatnya. */}
      <p className="mt-2 font-body text-sm leading-relaxed text-muted sm:text-xs">
        Mengganti bentuk halaman tidak menghapus blok yang sudah Anda isi. Yang berubah
        hanya kerangkanya.
      </p>
    </fieldset>
  );
}

function SketsaTataLetak({ jenis }: { jenis: TataLetak }) {
  return (
    <span aria-hidden="true" className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-[10px] border border-line bg-paper p-2">
      {jenis === 'toko' && (
        <>
          <span className="block h-3 rounded-[3px] bg-aksen/25" />
          <span className="relative -mt-1 ml-2 block h-4 w-4 rounded-full border-2 border-paper bg-aksen" />
          <span className="mt-1 grid grid-cols-4 gap-1">
            <i className="aspect-square rounded-[2px] bg-surface" />
            <i className="aspect-square rounded-[2px] bg-surface" />
            <i className="aspect-square rounded-[2px] bg-surface" />
            <i className="aspect-square rounded-[2px] bg-surface" />
          </span>
        </>
      )}
      {jenis === 'portofolio' && (
        <span className="grid h-full grid-cols-2 grid-rows-2 gap-1">
          <i className="row-span-2 rounded-[3px] bg-aksen/35" />
          <i className="rounded-[3px] bg-surface" />
          <i className="rounded-[3px] bg-aksen/15" />
        </span>
      )}
      {jenis === 'cerita' && (
        <span className="grid h-full grid-cols-[1.15fr_.85fr] gap-2">
          <span className="space-y-1.5 pt-1">
            <i className="block h-1.5 w-8 rounded-full bg-aksen" />
            <i className="block h-1 w-full rounded-full bg-line" />
            <i className="block h-1 w-4/5 rounded-full bg-line" />
            <i className="block h-1 w-3/5 rounded-full bg-line" />
          </span>
          <i className="rounded-[3px] bg-aksen/20" />
        </span>
      )}
    </span>
  );
}
