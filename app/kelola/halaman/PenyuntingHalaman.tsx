'use client';

import { useEffect, useRef, useState } from 'react';
import { lupakanFotoSaatPergi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Dialog from '@/components/Dialog';
import { useKabar } from '@/components/Pemberitahuan';
import RenderBlok from '@/components/blok/Blok';
import {
  JENIS_BLOK,
  LABEL_BLOK,
  blokKosong,
  fotoDalamBlok,
  jangkarHalaman,
  type Blok,
  type JenisBlok,
} from '@/lib/blok';
import type { Produk, Umkm } from '@/lib/types';
import { Galat, Judul } from '../Kotak';
import FormBlok from './FormBlok';

/**
 * Penyunting susunan halaman usaha.
 *
 * Mengurutkan memakai tombol NAIK/TURUN, bukan seret-lepas. Bukan karena
 * seret-lepas sulit dibuat, tapi karena ia tidak bisa dipakai dengan papan ketik
 * tanpa pustaka besar, dan di layar sentuh ia bertabrakan dengan gulir halaman —
 * persis di perangkat yang dipakai sebagian besar pemilik usaha di sini.
 *
 * Pratinjaunya memakai komponen render yang SAMA dengan halaman publik. Kalau
 * dibuatkan tiruan, tiruan itu akan meleset suatu hari dan orang akan menerbitkan
 * halaman yang tidak seperti yang dilihatnya.
 */
export default function PenyuntingHalaman({
  umkm,
  produk,
  kembali,
}: {
  umkm: Umkm;
  produk: Produk[];
  /** Ke mana tombol kembali menunjuk. Beda antara pemilik dan super admin. */
  kembali: { href: string; label: string };
}) {
  const router = useRouter();
  const kabar = useKabar();

  const [blok, setBlok] = useState<Blok[]>(umkm.halaman);
  const [kotor, setKotor] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState('');
  const [pilihJenis, setPilihJenis] = useState(false);
  const [akanDibuang, setAkanDibuang] = useState<Blok | null>(null);
  const [pengumuman, setPengumuman] = useState('');

  // Meninggalkan halaman dengan perubahan yang belum disimpan memicu peringatan
  // bawaan peramban. Susunan halaman adalah pekerjaan menulis; kehilangannya
  // karena salah tekan tombol kembali tidak bisa diurungkan dari mana pun.
  useEffect(() => {
    if (!kotor) return;
    function tanya(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', tanya);
    return () => window.removeEventListener('beforeunload', tanya);
  }, [kotor]);

  // Foto yang sudah tersimpan di sheet. Diperbarui tiap kali penyimpanan
  // berhasil — kalau tidak, meninggalkan halaman setelah menyimpan akan menyapu
  // foto yang baru saja disimpan.
  const fotoTersimpan = useRef(new Set(fotoDalamBlok(umkm.halaman)));

  // Setiap URL yang PERNAH muncul di penyunting ini, bukan cuma yang sekarang
  // masih terlihat. Tanpa ini, foto yang diunggah lalu BLOKNYA dibuang sebelum
  // disimpan akan lolos: ia sudah hilang dari `blok`, jadi tidak ada lagi yang
  // menyebutnya di mana pun.
  const pernahAda = useRef(new Set(fotoDalamBlok(umkm.halaman)));
  for (const u of fotoDalamBlok(blok)) pernahAda.current.add(u);

  /**
   * Sapu unggahan yang tidak jadi dipakai saat penyunting ditinggalkan.
   *
   * Yang sudah tersimpan sengaja TIDAK ikut disapu: kalau perubahannya
   * dibatalkan, halaman publiknya masih memakai foto itu.
   *
   * Aman kalaupun perhitungannya meleset — backend menolak menghapus URL yang
   * masih dipakai baris mana pun.
   */
  useEffect(() => {
    function pergi() {
      const yatim = [...pernahAda.current].filter((u) => !fotoTersimpan.current.has(u));
      if (yatim.length > 0) lupakanFotoSaatPergi(yatim);
    }
    window.addEventListener('beforeunload', pergi);
    return () => {
      window.removeEventListener('beforeunload', pergi);
      // Berpindah halaman di dalam aplikasi tidak memicu `beforeunload`.
      pergi();
    };
  }, []);

  function ubah(baru: Blok[]) {
    setBlok(baru);
    setKotor(true);
  }

  function ganti(id: string, isi: Blok) {
    ubah(blok.map((b) => (b.id === id ? isi : b)));
  }

  function geser(indeks: number, arah: -1 | 1) {
    const tujuan = indeks + arah;
    if (tujuan < 0 || tujuan >= blok.length) return;
    const baru = [...blok];
    [baru[indeks], baru[tujuan]] = [baru[tujuan], baru[indeks]];
    ubah(baru);
    // Diumumkan ke pembaca layar. Tanpa ini, pengguna papan ketik menekan tombol
    // dan tidak ada apa pun yang memberi tahu bahwa sesuatu berpindah.
    setPengumuman(
      `${LABEL_BLOK[baru[tujuan].jenis].nama} dipindah ke urutan ${tujuan + 1} dari ${baru.length}`
    );
  }

  function tambah(jenis: JenisBlok) {
    ubah([...blok, blokKosong(jenis)]);
    setPilihJenis(false);
  }

  async function simpan() {
    setGalat('');
    setMenyimpan(true);
    try {
      const res = await fetch('/api/umkm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: umkm.id, halaman: blok }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      // Yang barusan disimpan bukan lagi unggahan menggantung. Tanpa baris ini,
      // meninggalkan halaman sesudah menyimpan akan menyapu foto yang justru
      // baru saja dipasang.
      fotoTersimpan.current = new Set(fotoDalamBlok(blok));
      setKotor(false);
      kabar('Halaman tersimpan');
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
    } finally {
      setMenyimpan(false);
    }
  }

  const konteks = { umkm, produk, produkGagal: false, tataLetak: umkm.tataLetak };
  const tampil = blok.filter((b) => b.aktif);
  // Jangkar dihitung dari daftar yang sama dengan halaman publik, jadi blok yang
  // di pratinjau tidak muncul juga tidak akan muncul di sana.
  const jangkar = jangkarHalaman(tampil);

  return (
    <div className="space-y-6">
      <span role="status" aria-live="polite" className="sr-only">
        {pengumuman}
      </span>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={kembali.href} className="font-body text-sm text-muted transition-colors hover:text-ink">
            &larr; {kembali.label}
          </Link>
          <div className="mt-3">
            <Judul sub={`Halaman publiknya ada di /umkm/${umkm.slug}`}>Susun halaman</Judul>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {kotor && (
            <span className="font-body text-sm text-muted">Ada perubahan belum disimpan</span>
          )}
          <button
            type="button"
            onClick={simpan}
            disabled={menyimpan || !kotor}
            className="tekan flex min-h-11 items-center rounded-full bg-aksen px-6 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat disabled:opacity-50"
          >
            {menyimpan ? 'Menyimpan...' : 'Simpan halaman'}
          </button>
        </div>
      </div>

      {galat && <Galat pesan={galat} />}

      {blok.length === 0 && (
        <div className="rounded-kartu border border-dashed border-line bg-surface px-6 py-10 text-center">
          <p className="font-display text-base font-semibold text-ink">
            Halaman ini masih memakai susunan bawaan
          </p>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-relaxed text-muted text-pretty">
            Halamannya tetap tayang penuh sekarang. Tambahkan blok pertama kalau ingin
            menyusunnya sendiri.
          </p>
        </div>
      )}

      <ul className="space-y-4">
        {blok.map((b, i) => (
          <li key={b.id} className="rounded-kartu border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="min-w-0">
                <span className="font-body text-sm font-semibold text-ink">
                  {LABEL_BLOK[b.jenis].nama}
                </span>
                <span className="angka-rata ml-2 font-body text-xs text-muted">
                  {i + 1} dari {blok.length}
                </span>
                {!b.aktif && <span className="ml-2 font-body text-xs text-muted">· disembunyikan</span>}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <TombolIkon
                  label={`Pindahkan ${LABEL_BLOK[b.jenis].nama} ke atas`}
                  // Dimatikan, bukan disembunyikan. Tombol yang hilang-muncul
                  // membuat tombol di sebelahnya bergeser tepat saat jari
                  // hendak menekannya.
                  mati={i === 0}
                  onClick={() => geser(i, -1)}
                >
                  <path d="M6 9.5 10 5.5l4 4" />
                </TombolIkon>
                <TombolIkon
                  label={`Pindahkan ${LABEL_BLOK[b.jenis].nama} ke bawah`}
                  mati={i === blok.length - 1}
                  onClick={() => geser(i, 1)}
                >
                  <path d="M6 10.5 10 14.5l4-4" />
                </TombolIkon>
                <button
                  type="button"
                  onClick={() => ganti(b.id, { ...b, aktif: !b.aktif })}
                  className="tekan flex min-h-11 items-center rounded-full px-3 font-body text-sm text-muted transition-colors hover:text-ink"
                >
                  {b.aktif ? 'Sembunyikan' : 'Tampilkan'}
                </button>
                <button
                  type="button"
                  onClick={() => setAkanDibuang(b)}
                  className="tekan flex min-h-11 items-center rounded-full px-3 font-body text-sm text-muted transition-colors hover:text-ink"
                >
                  Buang
                </button>
              </div>
            </div>

            <div className="p-4">
              <FormBlok blok={b} onUbah={(baru) => ganti(b.id, baru)} />
            </div>
          </li>
        ))}
      </ul>

      <div>
        {pilihJenis ? (
          <div className="rounded-kartu border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-body text-sm font-semibold text-ink">Tambah blok apa?</span>
              <button
                type="button"
                onClick={() => setPilihJenis(false)}
                className="tekan flex min-h-11 items-center rounded-full px-4 font-body text-sm text-muted transition-colors hover:text-ink"
              >
                Batal
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {JENIS_BLOK.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => tambah(j)}
                  className="tekan rounded-kartu border border-line bg-paper p-3 text-left transition-colors hover:border-aksen"
                >
                  <span className="block font-body text-sm text-ink">{LABEL_BLOK[j].nama}</span>
                  <span className="mt-0.5 block font-body text-xs leading-snug text-muted">
                    {LABEL_BLOK[j].jelas}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPilihJenis(true)}
            className="tekan flex min-h-11 w-full items-center justify-center rounded-kartu border border-dashed border-line px-6 font-body text-sm text-muted transition-colors hover:border-aksen hover:text-ink"
          >
            + Tambah blok
          </button>
        )}
      </div>

      <section>
        <Judul sub="Persis seperti yang akan dilihat pengunjung. Belum tersimpan sampai tombol Simpan ditekan.">
          Pratinjau
        </Judul>
        <div
          data-tema={umkm.tema}
          className="mt-4 overflow-hidden rounded-kartu border border-line bg-paper"
        >
          {tampil.length === 0 ? (
            <p className="px-5 py-16 text-center font-body text-sm text-muted">
              Semua blok disembunyikan. Halaman publiknya akan memakai susunan bawaan.
            </p>
          ) : (
            <>
              {tampil.map((b) => (
                <RenderBlok key={b.id} blok={b} konteks={konteks} jangkar={jangkar.get(b.id)} />
              ))}
            </>
          )}
        </div>
      </section>

      <Dialog
        buka={akanDibuang !== null}
        judul={`Buang blok ${akanDibuang ? LABEL_BLOK[akanDibuang.jenis].nama : ''}?`}
        keterangan="Isi blok ini ikut hilang dan tidak bisa dikembalikan. Kalau cuma ingin menyembunyikannya sementara, pakai tombol Sembunyikan."
        teksIya="Buang blok"
        onIya={() => {
          if (akanDibuang) ubah(blok.filter((b) => b.id !== akanDibuang.id));
          setAkanDibuang(null);
        }}
        onBatal={() => setAkanDibuang(null)}
      />
    </div>
  );
}

function TombolIkon({
  label,
  mati,
  onClick,
  children,
}: {
  label: string;
  mati: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={mati}
      aria-label={label}
      className="tekan flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-ink disabled:opacity-30"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
