'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import FormProduk from '@/components/FormProduk';
import Dialog from '@/components/Dialog';
import { useKabar } from '@/components/Pemberitahuan';
import { formatRupiah, normalisasiFotoUrl } from '@/lib/api';
import type { Produk, Umkm } from '@/lib/types';
import { Galat, Kosong } from '../Kotak';

export default function PanelProduk({
  produk,
  daftarUmkm,
  profilUsaha,
  umkmTerkunci,
  adaSaringan,
  kataKunci,
  jalurBersih,
  kosongTotal,
}: {
  produk: Produk[];
  /** Terisi hanya untuk super admin; peran umkm tidak memilih pemilik. */
  daftarUmkm: Umkm[];
  /** Hanya profil milik sesi, supaya data usaha lain tidak dikirim ke peramban. */
  profilUsaha?: Umkm;
  umkmTerkunci?: string;
  adaSaringan: boolean;
  kataKunci: string;
  jalurBersih: string;
  kosongTotal: boolean;
}) {
  const router = useRouter();
  const kabar = useKabar();
  const [sedangDiedit, setSedangDiedit] = useState<Produk | null | undefined>(undefined);
  const [galat, setGalat] = useState('');
  const [akanDihapus, setAkanDihapus] = useState<Produk | null>(null);
  const [sibuk, setSibuk] = useState(false);

  function selesai(nama: string) {
    setSedangDiedit(undefined);
    kabar(`${nama} tersimpan`);
    // Data dimuat di server, jadi refresh router lebih tepat daripada menyimpan
    // salinan daftar di state klien dan menebak-nebak isinya setelah berubah.
    router.refresh();
  }

  async function hapus() {
    if (!akanDihapus) return;
    setGalat('');
    setSibuk(true);
    try {
      const res = await fetch(`/api/produk/${akanDihapus.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Tidak dapat dihapus.');
      kabar(`${akanDihapus.namaProduk} dihapus`);
      setAkanDihapus(null);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : String(err));
      setAkanDihapus(null);
    } finally {
      setSibuk(false);
    }
  }

  return (
    <section>
      {sedangDiedit === undefined && (
        <div className="flex justify-stretch sm:justify-end">
          <button
            type="button"
            onClick={() => setSedangDiedit(null)}
            className="tekan flex min-h-12 w-full items-center justify-center rounded-full bg-aksen px-6 font-body text-base font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat sm:min-h-11 sm:w-auto sm:text-sm"
          >
            Tambah produk
          </button>
        </div>
      )}

      {sedangDiedit !== undefined && (
        <div className="mb-6">
          <FormProduk
            produkAwal={sedangDiedit}
            daftarUmkm={daftarUmkm}
            profilUsaha={profilUsaha}
            umkmTerkunci={umkmTerkunci}
            onBatal={() => setSedangDiedit(undefined)}
            onTersimpan={selesai}
          />
        </div>
      )}

      {galat && (
        <div className="mt-4">
          <Galat pesan={galat} />
        </div>
      )}

      {produk.length === 0 ? (
        <div className="mt-4">
          {kosongTotal ? (
            <Kosong
              judul="Belum ada produk"
              jelas="Mulai dengan menambahkan foto, nama, dan harga produk pertama Anda."
            />
          ) : (
            <div className="rounded-kartu border border-dashed border-line bg-surface px-6 py-12 text-center">
              <p className="font-display text-base font-semibold text-ink">
                {kataKunci ? `Tidak ada yang cocok dengan "${kataKunci}"` : 'Tidak ada yang cocok'}
              </p>
              <p className="mt-2 font-body text-base text-muted sm:text-sm">
                Coba kata lain, atau tampilkan semuanya lagi.
              </p>
              {adaSaringan && (
                <Link
                  href={jalurBersih}
                  className="tekan mt-6 flex min-h-12 w-full items-center justify-center rounded-full border border-line px-6 font-body text-base text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink sm:inline-flex sm:min-h-11 sm:w-auto sm:text-sm"
                >
                  Hapus semua saringan
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-kartu border border-line">
          {produk.map((p) => {
            const foto = normalisasiFotoUrl(p.foto, 160);
            const nonaktif = p.status.toLowerCase() !== 'aktif';
            return (
              <li key={p.id} className="flex flex-wrap items-start gap-x-4 gap-y-3 p-4 sm:items-center">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-kartu bg-surface">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-muted/50">
                      {p.namaProduk.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 basis-40">
                  <h3 className="break-words font-body text-base font-semibold text-ink sm:truncate sm:text-sm sm:font-normal">{p.namaProduk}</h3>
                  <p className="mt-0.5 break-words font-body text-sm leading-relaxed text-muted sm:mt-0 sm:truncate sm:text-xs">
                    {p.namaUmkm || 'Usaha belum terhubung'} &middot; {formatRupiah(p.harga)}
                    {nonaktif && ' · nonaktif'}
                    {/* Ditandai jelas: produk tanpa umkmId tidak pernah muncul di
                        halaman UMKM mana pun, dan tanpa penanda ini tidak ada
                        yang tahu kenapa. */}
                    {!p.umkmId && ' · belum punya pemilik'}
                  </p>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:gap-1">
                  <button
                    type="button"
                    onClick={() => setSedangDiedit(p)}
                    className="tekan flex min-h-12 items-center justify-center rounded-full border border-line font-body text-base text-ink transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen sm:min-h-11 sm:border-0 sm:px-4 sm:text-sm sm:text-muted"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => setAkanDihapus(p)}
                    className="tekan flex min-h-12 items-center justify-center rounded-full border border-line font-body text-base text-ink transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen sm:min-h-11 sm:border-0 sm:px-4 sm:text-sm sm:text-muted"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        buka={akanDihapus !== null}
        judul={`Hapus ${akanDihapus?.namaProduk ?? 'produk'}?`}
        keterangan="Produk ini dan fotonya dihapus permanen. Tautan yang sudah tersebar ke produk ini akan mati. Tidak bisa dibatalkan."
        teksIya="Hapus produk"
        sibuk={sibuk}
        onIya={hapus}
        onBatal={() => !sibuk && setAkanDihapus(null)}
      />
    </section>
  );
}
