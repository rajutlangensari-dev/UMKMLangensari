'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Dialog from '@/components/Dialog';
import { useKabar } from '@/components/Pemberitahuan';
import { normalisasiFotoUrl } from '@/lib/api';
import type { Umkm } from '@/lib/types';

export default function BarisUmkm({
  umkm,
  jumlahProduk,
  jumlahAkun,
  tema,
  tataLetak,
}: {
  umkm: Umkm;
  jumlahProduk: number;
  jumlahAkun: number;
  tema: string;
  tataLetak: string;
}) {
  const router = useRouter();
  const kabar = useKabar();
  const [tanya, setTanya] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState('');

  const jadiNonaktif = umkm.status === 'aktif';

  async function ubahStatus() {
    setSibuk(true);
    setGalat('');
    try {
      const res = await fetch('/api/umkm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: umkm.id, status: jadiNonaktif ? 'nonaktif' : 'aktif' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      kabar(`${umkm.nama} ${jadiNonaktif ? 'dinonaktifkan' : 'diaktifkan'}`);
      setTanya(false);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
      setTanya(false);
    } finally {
      setSibuk(false);
    }
  }

  const foto = normalisasiFotoUrl(umkm.foto, 96);

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-3 p-4 sm:items-center">
      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-base sm:text-sm font-bold text-muted/60">
            {umkm.nama.charAt(0)}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1 basis-44">
        <Link href={`/kelola/umkm/${umkm.id}`} className="warna-interaktif group block">
          <span className="block break-words font-body text-base font-semibold text-ink sm:truncate sm:text-sm sm:font-normal">{umkm.nama}</span>
        </Link>
        <p className="mt-0.5 break-words font-body text-sm leading-relaxed text-muted sm:mt-0 sm:truncate sm:text-xs">
          /umkm/{umkm.slug} &middot; {jumlahProduk} produk &middot; {jumlahAkun} akun &middot; {tataLetak},{' '}
          {tema}
          {umkm.status === 'nonaktif' && ' · nonaktif'}
          {umkm.halaman.length === 0 && ' · halaman bawaan'}
        </p>
        {galat && (
          <p role="alert" className="mt-1 font-body text-sm text-ink sm:text-xs">
            {galat}
          </p>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:flex-wrap sm:gap-1">
        <Link
          href={`/kelola/umkm/${umkm.id}`}
          className="tekan flex min-h-12 items-center justify-center rounded-full border border-line font-body text-base text-ink transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen sm:min-h-11 sm:border-0 sm:px-4 sm:text-sm sm:text-muted"
        >
          Kelola
        </Link>
        <Link
          href={`/umkm/${umkm.slug}`}
          className="tekan flex min-h-12 items-center justify-center rounded-full border border-line font-body text-base text-ink transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen sm:min-h-11 sm:border-0 sm:px-4 sm:text-sm sm:text-muted"
        >
          Lihat
        </Link>
        <button
          type="button"
          onClick={() => setTanya(true)}
          className="tekan col-span-2 flex min-h-12 items-center justify-center rounded-full border border-line font-body text-base text-ink transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen sm:col-span-1 sm:min-h-11 sm:border-0 sm:px-4 sm:text-sm sm:text-muted"
        >
          {jadiNonaktif ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div>

      <Dialog
        buka={tanya}
        judul={jadiNonaktif ? `Nonaktifkan ${umkm.nama}?` : `Aktifkan ${umkm.nama}?`}
        merusak={jadiNonaktif}
        keterangan={
          jadiNonaktif ? (
            <>
              Halaman <strong className="text-ink">/umkm/{umkm.slug}</strong> tidak bisa dibuka lagi,
              dan <strong className="text-ink">{jumlahProduk} produk</strong> miliknya hilang dari
              katalog publik. Datanya tidak dihapus dan bisa diaktifkan kembali kapan saja.
              <br />
              <br />
              Akun pemiliknya tetap bisa masuk dan membenahi tokonya.
            </>
          ) : (
            <>
              Halaman <strong className="text-ink">/umkm/{umkm.slug}</strong> bisa dibuka lagi, dan{' '}
              {jumlahProduk} produk miliknya kembali tampil di katalog publik.
            </>
          )
        }
        teksIya={jadiNonaktif ? 'Nonaktifkan usaha' : 'Aktifkan usaha'}
        sibuk={sibuk}
        onIya={ubahStatus}
        onBatal={() => !sibuk && setTanya(false)}
      />
    </li>
  );
}
