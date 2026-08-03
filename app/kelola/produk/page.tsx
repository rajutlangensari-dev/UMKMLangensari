import Link from 'next/link';
import { wajibSesi } from '@/lib/sesi';
import { ambilProdukSemuaServer, ambilUmkmSemua } from '@/lib/backend';
import { Galat, Judul } from '../Kotak';
import Cari from '../Cari';
import { cocok } from '../cocok';
import PanelProduk from './PanelProduk';
import { produkDenganProfil } from '@/lib/produk';

export const metadata = { title: 'Produk' };

type Param = { q?: string; umkm?: string; status?: string; pemilik?: string };

export default async function HalamanProduk({ searchParams }: { searchParams: Param }) {
  const sesi = wajibSesi();
  const superAdmin = sesi.peran === 'admin';

  let produk: Awaited<ReturnType<typeof ambilProdukSemuaServer>> = [];
  let umkm: Awaited<ReturnType<typeof ambilUmkmSemua>> = [];
  let gagal = '';
  try {
    [produk, umkm] = await Promise.all([ambilProdukSemuaServer(), ambilUmkmSemua()]);
  } catch (err) {
    gagal = err instanceof Error ? err.message : 'Data tidak dapat dimuat.';
  }

  // Penyaringan menurut peran dilakukan DI SINI, di server, SEBELUM apa pun
  // dikirim ke browser. Kalau dikerjakan di klien, data UMKM lain tetap sampai
  // ke perangkatnya dan tinggal dibuka lewat alat pengembang. Saringan di bawah
  // ini bekerja di atas hasilnya — ia alat menemukan, bukan pengaman.
  const produkTerkini = produkDenganProfil(produk, umkm);
  const milik = superAdmin
    ? produkTerkini
    : produkTerkini.filter((p) => p.umkmId === sesi.umkmId);

  const q = searchParams.q ?? '';
  const namaUmkm = Object.fromEntries(umkm.map((u) => [u.id, u.nama]));

  const tampil = milik.filter((p) => {
    if (searchParams.umkm && p.umkmId !== searchParams.umkm) return false;
    if (searchParams.status === 'aktif' && p.status.toLowerCase() !== 'aktif') return false;
    if (searchParams.status === 'nonaktif' && p.status.toLowerCase() === 'aktif') return false;
    if (searchParams.pemilik === 'kosong' && p.umkmId) return false;
    return cocok(q, p.namaProduk, p.kategori, p.namaUmkm, namaUmkm[p.umkmId]);
  });

  const jalur = '/kelola/produk';
  const url = (ubah: Partial<Param>) => {
    const p = new URLSearchParams();
    const gabung = { ...searchParams, ...ubah };
    for (const [k, v] of Object.entries(gabung)) if (v) p.set(k, String(v));
    const s = p.toString();
    return s ? `${jalur}?${s}` : jalur;
  };

  const adaSaringan = Boolean(q || searchParams.umkm || searchParams.status || searchParams.pemilik);
  const yatim = superAdmin ? milik.filter((p) => !p.umkmId).length : 0;

  return (
    <div className="space-y-6">
      {gagal && <Galat pesan={gagal} />}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <Judul
          sub={
            adaSaringan
              ? `${tampil.length} dari ${milik.length} produk`
              : `${milik.length} produk`
          }
        >
          Produk
        </Judul>
        <Cari nama="q" label="Cari produk" awal={q} />
      </div>

      {superAdmin && (
        <div className="space-y-3">
          <Saring
            label="Usaha"
            butir={[
              { href: url({ umkm: '' }), teks: 'Semua', aktif: !searchParams.umkm },
              ...umkm.map((u) => ({
                href: url({ umkm: u.id }),
                teks: u.nama,
                aktif: searchParams.umkm === u.id,
              })),
            ]}
          />
          <Saring
            label="Keadaan"
            butir={[
              { href: url({ status: '', pemilik: '' }), teks: 'Semua', aktif: !searchParams.status && !searchParams.pemilik },
              { href: url({ status: 'aktif', pemilik: '' }), teks: 'Tayang', aktif: searchParams.status === 'aktif' },
              { href: url({ status: 'nonaktif', pemilik: '' }), teks: 'Nonaktif', aktif: searchParams.status === 'nonaktif' },
              ...(yatim > 0
                ? [
                    {
                      href: url({ pemilik: 'kosong', status: '' }),
                      teks: `Belum punya pemilik (${yatim})`,
                      aktif: searchParams.pemilik === 'kosong',
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}

      <PanelProduk
        produk={tampil}
        daftarUmkm={superAdmin ? umkm : []}
        profilUsaha={superAdmin ? undefined : umkm.find((u) => u.id === sesi.umkmId)}
        umkmTerkunci={sesi.umkmId}
        adaSaringan={adaSaringan}
        kataKunci={q}
        jalurBersih={jalur}
        kosongTotal={milik.length === 0}
      />
    </div>
  );
}

function Saring({
  label,
  butir,
}: {
  label: string;
  butir: { href: string; teks: string; aktif: boolean }[];
}) {
  if (butir.length <= 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-full font-body text-sm font-semibold text-muted sm:w-auto sm:text-xs sm:font-normal sm:uppercase sm:tracking-label">{label}</span>
      {butir.map((b) => (
        <Link
          key={b.href + b.teks}
          href={b.href}
          scroll={false}
          aria-current={b.aktif ? 'true' : undefined}
          className={`tekan flex min-h-12 items-center rounded-full px-4 font-body text-base transition-[transform,color,background-color,border-color] duration-150 ease-out sm:min-h-9 sm:text-sm ${
            b.aktif
              ? 'bg-aksen font-semibold text-aksen-ink'
              : 'border border-line text-muted hover:border-aksen hover:text-ink'
          }`}
        >
          {b.teks}
        </Link>
      ))}
    </div>
  );
}
