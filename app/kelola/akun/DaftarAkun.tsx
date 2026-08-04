'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Dialog from '@/components/Dialog';
import { useKabar } from '@/components/Pemberitahuan';
import type { Akun, Umkm } from '@/lib/types';
import { Judul } from '../Kotak';
import Cari from '../Cari';
import { cocok } from '../cocok';
import FormAkunBaru from './FormAkunBaru';
import KartuSandi from './KartuSandi';

export default function DaftarAkun({
  akun,
  daftarUmkm,
  akunSaya,
  kataKunci,
}: {
  akun: Akun[];
  daftarUmkm: Umkm[];
  akunSaya: string;
  kataKunci: string;
}) {
  const router = useRouter();
  const kabar = useKabar();
  const [sibuk, setSibuk] = useState('');
  const [galat, setGalat] = useState('');
  const [sandiBaru, setSandiBaru] = useState<{ nama: string; sandi: string } | null>(null);
  const [tanya, setTanya] = useState<{ akun: Akun; jenis: 'sandi' | 'status' } | null>(null);
  const [buatBaru, setBuatBaru] = useState(false);

  const namaUmkm = Object.fromEntries(daftarUmkm.map((u) => [u.id, u.nama]));
  const tampil = akun.filter((a) => cocok(kataKunci, a.namaPengguna, namaUmkm[a.umkmId]));

  async function kirim(id: string, isi: Record<string, unknown>) {
    setGalat('');
    setSibuk(id);
    try {
      const res = await fetch('/api/akun', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...isi }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat disimpan.');
      return json;
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setSibuk('');
    }
  }

  async function jalankan() {
    if (!tanya) return;
    const { akun: a, jenis } = tanya;
    setTanya(null);

    if (jenis === 'sandi') {
      const json = await kirim(a.id, { aksi: 'setelUlangSandi' });
      if (json?.sandi) setSandiBaru({ nama: a.namaPengguna, sandi: json.sandi });
      return;
    }

    const jadiNonaktif = a.status === 'aktif';
    const json = await kirim(a.id, {
      aksi: 'setStatus',
      status: jadiNonaktif ? 'nonaktif' : 'aktif',
    });
    if (json) {
      kabar(`${a.namaPengguna} ${jadiNonaktif ? 'dinonaktifkan' : 'diaktifkan'}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Judul
          sub={
            kataKunci
              ? `${tampil.length} dari ${akun.length} akun`
              : `${akun.length} akun bisa masuk ke panel ini`
          }
        >
          Akun
        </Judul>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Cari nama="q" label="Cari akun" awal={kataKunci} />
          {!buatBaru && (
            <button
              type="button"
              onClick={() => setBuatBaru(true)}
              className="tekan flex min-h-12 w-full items-center justify-center rounded-full bg-aksen px-6 font-body text-base font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat sm:min-h-11 sm:w-auto sm:text-sm"
            >
              Tambah akun
            </button>
          )}
        </div>
      </div>

      {buatBaru && (
        <FormAkunBaru
          daftarUmkm={daftarUmkm}
          onBatal={() => setBuatBaru(false)}
          onSelesai={(nama, sandi) => {
            setBuatBaru(false);
            setSandiBaru({ nama, sandi });
            router.refresh();
          }}
        />
      )}

      {sandiBaru && (
        <KartuSandi
          nama={sandiBaru.nama}
          sandi={sandiBaru.sandi}
          onTutup={() => setSandiBaru(null)}
        />
      )}

      {galat && (
        <p role="alert" className="rounded-kartu border border-line bg-surface p-4 font-body text-base sm:text-sm text-ink">
          {galat}
        </p>
      )}

      <ul className="divide-y divide-line overflow-hidden rounded-kartu border border-line">
        {tampil.map((a) => {
          const diriSendiri = a.id === akunSaya;
          const belumPernah = !a.terakhirMasuk;
          return (
            <li key={a.id} className="flex flex-wrap items-start gap-x-4 gap-y-3 p-4 sm:items-center sm:py-3">
              <div className="min-w-0 flex-1 basis-44">
                <p className="break-words font-body text-base font-semibold text-ink sm:truncate sm:text-sm sm:font-normal">
                  {a.namaPengguna}
                  {diriSendiri && <span className="text-muted"> · Anda</span>}
                </p>
                <p className="mt-0.5 break-words font-body text-sm leading-relaxed text-muted sm:mt-0 sm:truncate sm:text-xs">
                  {a.peran === 'admin'
                    ? 'Super admin'
                    : namaUmkm[a.umkmId] || 'Usaha tidak ditemukan'}
                  {a.status === 'nonaktif' && ' · nonaktif'}
                  {a.terakhirMasuk
                    ? ` · terakhir masuk ${new Date(a.terakhirMasuk).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}`
                    : ''}
                </p>
                {/* Belum pernah masuk hampir selalu berarti kata sandinya belum
                    sampai ke orangnya, bukan bahwa dia malas. Ditandai supaya
                    ada yang menindaklanjuti, bukan sekadar dicatat. */}
                {belumPernah && a.status === 'aktif' && (
                  <p className="mt-1 font-body text-sm leading-relaxed text-aksen sm:mt-0.5 sm:text-xs">
                    Belum pernah masuk — kata sandinya mungkin belum sampai ke orangnya
                  </p>
                )}
              </div>

              <div className="grid w-full grid-cols-1 gap-2 min-[390px]:grid-cols-2 sm:flex sm:w-auto sm:shrink-0 sm:flex-wrap sm:gap-1">
                <button
                  type="button"
                  onClick={() => setTanya({ akun: a, jenis: 'sandi' })}
                  disabled={sibuk === a.id}
                  className="tekan flex min-h-12 items-center justify-center rounded-full border border-line px-4 font-body text-base text-ink transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen disabled:opacity-50 sm:min-h-11 sm:border-0 sm:text-sm sm:text-muted"
                >
                  Setel ulang sandi
                </button>
                <button
                  type="button"
                  onClick={() => setTanya({ akun: a, jenis: 'status' })}
                  disabled={sibuk === a.id || diriSendiri}
                  // Akun sendiri tidak bisa dinonaktifkan: super admin yang
                  // melakukannya langsung kehilangan panel, dan kalau dia
                  // satu-satunya, portal tidak punya jalan masuk lagi selain
                  // editor Apps Script.
                  title={
                    diriSendiri
                      ? 'Anda tidak bisa menonaktifkan akun sendiri — kalau ini satu-satunya akun super admin, portal jadi tidak bisa dikelola sama sekali.'
                      : undefined
                  }
                  className="tekan flex min-h-12 items-center justify-center rounded-full border border-line px-4 font-body text-base text-ink transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen disabled:opacity-40 sm:min-h-11 sm:border-0 sm:text-sm sm:text-muted"
                >
                  {a.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>
            </li>
          );
        })}
        {tampil.length === 0 && (
          <li className="px-4 py-10 text-center font-body text-base text-muted sm:text-sm">
            Tidak ada akun yang cocok dengan &ldquo;{kataKunci}&rdquo;.
          </li>
        )}
      </ul>

      <Dialog
        buka={tanya !== null}
        judul={
          tanya?.jenis === 'sandi'
            ? `Setel ulang kata sandi ${tanya.akun.namaPengguna}?`
            : tanya?.akun.status === 'aktif'
              ? `Nonaktifkan ${tanya.akun.namaPengguna}?`
              : `Aktifkan ${tanya?.akun.namaPengguna}?`
        }
        merusak={tanya?.jenis === 'sandi' || tanya?.akun.status === 'aktif'}
        keterangan={
          tanya?.jenis === 'sandi' ? (
            <>
              Kata sandi lamanya <strong className="text-ink">langsung tidak berlaku</strong>, dan
              orangnya tidak bisa masuk sampai menerima yang baru.
              <br />
              <br />
              Kata sandi baru ditampilkan <strong className="text-ink">sekali saja</strong>. Catat
              dulu sebelum menutupnya — tidak ada cara melihatnya lagi.
            </>
          ) : tanya?.akun.status === 'aktif' ? (
            <>
              <strong className="text-ink">{tanya.akun.namaPengguna}</strong> tidak akan bisa masuk
              lagi. Halaman usahanya tetap tayang dan produknya tidak hilang.
            </>
          ) : (
            <>
              <strong className="text-ink">{tanya?.akun.namaPengguna}</strong> bisa masuk lagi
              memakai kata sandi lamanya.
            </>
          )
        }
        teksIya={
          tanya?.jenis === 'sandi'
            ? 'Setel ulang sandi'
            : tanya?.akun.status === 'aktif'
              ? 'Nonaktifkan akun'
              : 'Aktifkan akun'
        }
        onIya={jalankan}
        onBatal={() => setTanya(null)}
      />
    </div>
  );
}
