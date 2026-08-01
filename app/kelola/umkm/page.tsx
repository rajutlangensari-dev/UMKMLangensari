import { redirect } from 'next/navigation';
import Link from 'next/link';
import { wajibSesi } from '@/lib/sesi';
import { ambilAkunSemua, ambilProdukSemuaServer, ambilUmkmSemua } from '@/lib/backend';
import { LABEL_TATA_LETAK, LABEL_TEMA } from '@/lib/blok';
import { Galat, Judul, Kosong } from '../Kotak';
import Cari from '../Cari';
import { cocok } from '../cocok';
import BarisUmkm from './BarisUmkm';

export const metadata = { title: 'Pelaku usaha' };

export default async function HalamanDaftarUmkm({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const sesi = wajibSesi();
  // Layout /kelola hanya memastikan sudah masuk. Pembatasan peran ada di sini,
  // dan jalur tulisnya dijaga terpisah di /api/umkm — menebak alamat halaman ini
  // tidak cukup untuk mengubah apa pun.
  if (sesi.peran !== 'admin') redirect('/kelola');

  let umkm: Awaited<ReturnType<typeof ambilUmkmSemua>> = [];
  let produk: Awaited<ReturnType<typeof ambilProdukSemuaServer>> = [];
  let akun: Awaited<ReturnType<typeof ambilAkunSemua>> = [];
  let gagal = '';
  try {
    [umkm, produk, akun] = await Promise.all([
      ambilUmkmSemua(),
      ambilProdukSemuaServer(),
      ambilAkunSemua(),
    ]);
  } catch (err) {
    gagal = err instanceof Error ? err.message : 'Data tidak dapat dimuat.';
  }

  const q = searchParams.q ?? '';
  const tampil = umkm.filter((u) => cocok(q, u.nama, u.slug, u.alamat));

  return (
    <div className="space-y-6">
      {gagal && <Galat pesan={gagal} />}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <Judul sub={q ? `${tampil.length} dari ${umkm.length} usaha` : `${umkm.length} usaha terdaftar`}>
          Pelaku usaha
        </Judul>
        <div className="flex flex-wrap items-center gap-3">
          <Cari nama="q" label="Cari usaha" awal={q} />
          <Link
            href="/kelola/umkm/baru"
            className="tekan flex min-h-11 items-center rounded-full bg-aksen px-6 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
          >
            Daftarkan usaha
          </Link>
        </div>
      </div>

      {tampil.length === 0 ? (
        umkm.length === 0 ? (
          <Kosong
            judul="Belum ada usaha terdaftar"
            jelas="Daftarkan yang pertama. Halamannya langsung hidup di /umkm/<slug> tanpa perlu menulis kode atau deploy ulang."
            aksi={{ href: '/kelola/umkm/baru', label: 'Daftarkan usaha' }}
          />
        ) : (
          <div className="rounded-kartu border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="font-display text-base font-semibold text-ink">
              Tidak ada yang cocok dengan &ldquo;{q}&rdquo;
            </p>
            <Link
              href="/kelola/umkm"
              className="tekan mt-6 inline-flex min-h-11 items-center rounded-full border border-line px-6 font-body text-sm text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink"
            >
              Tampilkan semua
            </Link>
          </div>
        )
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-kartu border border-line">
          {tampil.map((u) => (
            <BarisUmkm
              key={u.id}
              umkm={u}
              jumlahProduk={produk.filter((p) => p.umkmId === u.id).length}
              jumlahAkun={akun.filter((a) => a.umkmId === u.id).length}
              tema={LABEL_TEMA[u.tema].nama}
              tataLetak={LABEL_TATA_LETAK[u.tataLetak].nama}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
