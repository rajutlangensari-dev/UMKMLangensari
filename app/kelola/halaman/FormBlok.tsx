'use client';

import { useRef, useState } from 'react';
import { lupakanFoto, uploadFoto } from '@/lib/api';
import { MAKS_FAKTA, MAKS_GALERI, MAKS_KEUNGGULAN, SOROT_KATALOG, type Blok } from '@/lib/blok';

/**
 * Formulir isi satu blok. Tiap jenis hanya menampilkan field miliknya sendiri.
 *
 * Tidak ada penyunting teks kaya. Isi blok adalah teks polos, dan itu yang
 * membuat ia aman dirender tanpa `dangerouslySetInnerHTML` di halaman publik.
 * Paragraf dipisah dengan menekan Enter dua kali — cara yang sudah dikenal siapa
 * pun yang pernah mengetik pesan panjang.
 */
export default function FormBlok({
  blok,
  onUbah,
}: {
  blok: Blok;
  onUbah: (b: Blok) => void;
}) {
  switch (blok.jenis) {
    case 'hero':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Teks lebar label="Judul" nilai={blok.judul} onUbah={(v) => onUbah({ ...blok, judul: v })} bantuan="Kosongkan untuk memakai nama usaha." />
          <Teks lebar label="Kalimat pembuka" nilai={blok.subJudul} onUbah={(v) => onUbah({ ...blok, subJudul: v })} />
          <FotoSatu label="Foto sampul" nilai={blok.foto} onUbah={(v) => onUbah({ ...blok, foto: v })} bantuan="Kosongkan untuk memakai foto profil usaha." />
          <Teks label="Teks tombol" nilai={blok.teksTombol} onUbah={(v) => onUbah({ ...blok, teksTombol: v })} bantuan="Kosongkan untuk menyembunyikan tombolnya." />
        </div>
      );

    case 'cerita':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Teks label="Judul" nilai={blok.judul} onUbah={(v) => onUbah({ ...blok, judul: v })} />
          <Pilih
            label="Posisi foto"
            nilai={blok.posisiFoto}
            pilihan={[
              { nilai: 'kiri', teks: 'Foto di kiri' },
              { nilai: 'kanan', teks: 'Foto di kanan' },
            ]}
            onUbah={(v) => onUbah({ ...blok, posisiFoto: v === 'kanan' ? 'kanan' : 'kiri' })}
          />
          <Panjang
            lebar
            label="Cerita"
            nilai={blok.teks}
            onUbah={(v) => onUbah({ ...blok, teks: v })}
            bantuan="Tekan Enter dua kali untuk memulai paragraf baru."
          />
          <FotoSatu label="Foto pendamping" nilai={blok.foto} onUbah={(v) => onUbah({ ...blok, foto: v })} />
        </div>
      );

    case 'keunggulan':
      return (
        <div className="space-y-4">
          <Teks label="Judul" nilai={blok.judul} onUbah={(v) => onUbah({ ...blok, judul: v })} />
          <Deret
            butir={blok.butir}
            maks={MAKS_KEUNGGULAN}
            kosong={{ judul: '', teks: '' }}
            namaButir="keunggulan"
            onUbah={(butir) => onUbah({ ...blok, butir })}
            render={(b, set) => (
              <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                <Teks label="Judul" nilai={b.judul} onUbah={(v) => set({ ...b, judul: v })} />
                <Teks label="Keterangan" nilai={b.teks} onUbah={(v) => set({ ...b, teks: v })} />
              </div>
            )}
          />
        </div>
      );

    case 'fakta':
      return (
        <Deret
          butir={blok.butir}
          maks={MAKS_FAKTA}
          kosong={{ angka: '', label: '' }}
          namaButir="angka"
          onUbah={(butir) => onUbah({ ...blok, butir })}
          render={(b, set) => (
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <Teks label="Angka" nilai={b.angka} onUbah={(v) => set({ ...b, angka: v })} bantuan="Contoh: 12, 40+, 3 tahun" />
              <Teks label="Keterangan" nilai={b.label} onUbah={(v) => set({ ...b, label: v })} bantuan="Contoh: perajin aktif" />
            </div>
          )}
        />
      );

    case 'galeri':
      return (
        <div className="space-y-4">
          <Teks label="Judul" nilai={blok.judul} onUbah={(v) => onUbah({ ...blok, judul: v })} />
          <Deret
            butir={blok.foto}
            maks={MAKS_GALERI}
            kosong={{ url: '', keterangan: '' }}
            namaButir="foto"
            onUbah={(foto) => onUbah({ ...blok, foto })}
            render={(f, set) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <FotoSatu label="Foto" nilai={f.url} onUbah={(v) => set({ ...f, url: v })} />
                <Teks
                  label="Keterangan"
                  nilai={f.keterangan}
                  onUbah={(v) => set({ ...f, keterangan: v })}
                  bantuan="Juga dipakai pembaca layar. Boleh dikosongkan."
                />
              </div>
            )}
          />
        </div>
      );

    case 'katalog':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Teks label="Judul" nilai={blok.judul} onUbah={(v) => onUbah({ ...blok, judul: v })} />
          <Teks
            label="Jumlah yang disorot"
            nilai={blok.batas ? String(blok.batas) : ''}
            onUbah={(v) => onUbah({ ...blok, batas: Number(v.replace(/\D/g, '')) || 0 })}
            bantuan={`Kosongkan untuk memakai ${SOROT_KATALOG}. Semua produk tetap bisa dilihat di halaman katalog, yang tautannya muncul otomatis di bawah sorotan ini.`}
          />
        </div>
      );

    case 'kontak':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Teks label="Judul" nilai={blok.judul} onUbah={(v) => onUbah({ ...blok, judul: v })} />
          <Panjang
            label="Jam buka"
            nilai={blok.jamBuka}
            onUbah={(v) => onUbah({ ...blok, jamBuka: v })}
            bantuan="Boleh dikosongkan. Contoh: Senin–Sabtu, 08.00–17.00"
          />
          <p className="font-body text-xs leading-relaxed text-muted sm:col-span-2">
            Nomor WhatsApp dan alamat diambil dari profil usaha, jadi cukup diubah di
            satu tempat dan seluruh halaman ikut.
          </p>
        </div>
      );
  }
}

// ---------- Bagian isian ----------

function Bungkus({
  label,
  bantuan,
  lebar,
  children,
}: {
  label: string;
  bantuan?: string;
  lebar?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${lebar ? 'sm:col-span-2' : ''}`}>
      <span className="font-body text-sm text-muted">{label}</span>
      {children}
      {bantuan && <span className="mt-1 block font-body text-xs text-muted/80">{bantuan}</span>}
    </label>
  );
}

const inputCls =
  'mt-1.5 w-full min-h-11 rounded-kartu border border-line bg-paper px-4 py-2.5 font-body text-sm text-ink placeholder:text-muted focus:border-aksen focus:outline-none';

function Teks({
  label,
  nilai,
  onUbah,
  bantuan,
  lebar,
}: {
  label: string;
  nilai: string;
  onUbah: (v: string) => void;
  bantuan?: string;
  lebar?: boolean;
}) {
  return (
    <Bungkus label={label} bantuan={bantuan} lebar={lebar}>
      <input className={inputCls} value={nilai} onChange={(e) => onUbah(e.target.value)} />
    </Bungkus>
  );
}

function Panjang({
  label,
  nilai,
  onUbah,
  bantuan,
  lebar,
}: {
  label: string;
  nilai: string;
  onUbah: (v: string) => void;
  bantuan?: string;
  lebar?: boolean;
}) {
  return (
    <Bungkus label={label} bantuan={bantuan} lebar={lebar}>
      <textarea
        className={`${inputCls} min-h-32`}
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
      />
    </Bungkus>
  );
}

function Pilih({
  label,
  nilai,
  pilihan,
  onUbah,
}: {
  label: string;
  nilai: string;
  pilihan: { nilai: string; teks: string }[];
  onUbah: (v: string) => void;
}) {
  return (
    <Bungkus label={label}>
      <select className={inputCls} value={nilai} onChange={(e) => onUbah(e.target.value)}>
        {pilihan.map((p) => (
          <option key={p.nilai} value={p.nilai}>
            {p.teks}
          </option>
        ))}
      </select>
    </Bungkus>
  );
}

function FotoSatu({
  label,
  nilai,
  onUbah,
  bantuan,
}: {
  label: string;
  nilai: string;
  onUbah: (v: string) => void;
  bantuan?: string;
}) {
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState('');

  // Nilai saat penyunting dibuka. Itu yang tersimpan di sheet; apa pun selainnya
  // hasil unggahan sesi ini. Memakai ref, bukan state, supaya nilainya tidak
  // ikut berubah tiap kali fotonya diganti.
  const asal = useRef(nilai);

  function lepasKalauBelumTersimpan(url: string) {
    if (url && url !== asal.current) lupakanFoto(url);
  }

  async function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSibuk(true);
    setGalat('');
    try {
      const baru = await uploadFoto(file);
      // Dilepas setelah unggahan baru berhasil, bukan sebelum.
      lepasKalauBelumTersimpan(nilai);
      onUbah(baru);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
    } finally {
      setSibuk(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <span className="font-body text-sm text-muted">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-kartu bg-paper">
          {nilai ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={nilai} alt="" className="h-full w-full object-cover" />
          ) : sibuk ? (
            <span className="kilau block h-full w-full" />
          ) : (
            <span className="flex h-full w-full items-center justify-center border border-dashed border-line text-muted/50">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
                <path d="M12 16V6m0 0L8 10m4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          )}
        </span>
        <div className="flex flex-wrap gap-1">
          <label className="tekan flex min-h-11 cursor-pointer items-center rounded-full border border-line px-4 font-body text-sm text-ink transition-colors hover:border-aksen">
            {sibuk ? 'Mengunggah...' : nilai ? 'Ganti' : 'Pilih foto'}
            <input type="file" accept="image/*" className="hidden" disabled={sibuk} onChange={pilih} />
          </label>
          {nilai && (
            <button
              type="button"
              onClick={() => {
                lepasKalauBelumTersimpan(nilai);
                onUbah('');
              }}
              className="tekan flex min-h-11 items-center rounded-full px-3 font-body text-sm text-muted transition-colors hover:text-ink"
            >
              Buang
            </button>
          )}
        </div>
      </div>
      {galat && (
        <p role="alert" className="mt-1 font-body text-xs text-ink">
          {galat}
        </p>
      )}
      {bantuan && <p className="mt-1 font-body text-xs text-muted/80">{bantuan}</p>}
    </div>
  );
}

/** Daftar butir yang bisa ditambah, dibuang, dan diurutkan. Dipakai tiga blok. */
function Deret<T>({
  butir,
  maks,
  kosong,
  namaButir,
  onUbah,
  render,
}: {
  butir: T[];
  maks: number;
  kosong: T;
  namaButir: string;
  onUbah: (b: T[]) => void;
  render: (butir: T, set: (b: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {butir.map((b, i) => (
        <div key={i} className="rounded-kartu border border-line bg-paper p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="angka-rata font-body text-xs text-muted">
              {namaButir} {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onUbah(butir.filter((_, k) => k !== i))}
              className="tekan flex min-h-9 items-center rounded-full px-3 font-body text-xs text-muted transition-colors hover:text-ink"
            >
              Buang
            </button>
          </div>
          {render(b, (baru) => onUbah(butir.map((x, k) => (k === i ? baru : x))))}
        </div>
      ))}

      {butir.length < maks ? (
        <button
          type="button"
          onClick={() => onUbah([...butir, kosong])}
          className="tekan flex min-h-11 w-full items-center justify-center rounded-kartu border border-dashed border-line font-body text-sm text-muted transition-colors hover:border-aksen hover:text-ink"
        >
          + Tambah {namaButir}
        </button>
      ) : (
        // Batasnya disebut, bukan cuma tombolnya hilang. Tombol yang lenyap
        // tanpa keterangan terbaca sebagai kerusakan.
        <p className="font-body text-xs text-muted">
          Sudah mencapai batas {maks} {namaButir}. Buang salah satu untuk menambah yang lain.
        </p>
      )}
    </div>
  );
}
