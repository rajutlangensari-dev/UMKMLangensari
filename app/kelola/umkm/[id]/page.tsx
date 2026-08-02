import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { wajibSesi } from '@/lib/sesi';
import { ambilAkunSemua, ambilProdukSemuaServer, ambilUmkmSemua } from '@/lib/backend';
import { LABEL_TATA_LETAK, namaTema } from '@/lib/blok';
import { formatRupiah } from '@/lib/api';
import { Galat, Judul, Kartu } from '../../Kotak';
import FormProfilUmkm from '../../profil/FormProfilUmkm';

export const metadata = { title: 'Kelola usaha' };

/**
 * Satu usaha, satu halaman: profil, susunan halaman, produk, dan akunnya.
 *
 * Sebelumnya mengurus satu usaha berarti berpindah tiga tab lalu memilihnya
 * lagi dari daftar di tiap tab. Pekerjaannya satu; tempatnya juga harus satu.
 */
export default async function DetailUmkm({ params }: { params: { id: string } }) {
  const sesi = wajibSesi();
  // Peran umkm tidak punya urusan di sini: halamannya sendiri ada di
  // /kelola/profil dan /kelola/halaman. Penjagaan tulisnya tetap terpisah di
  // /api/umkm — menebak alamat ini tidak cukup untuk mengubah apa pun.
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

  if (gagal) return <Galat pesan={gagal} />;

  const usaha = umkm.find((u) => u.id === params.id);
  if (!usaha) notFound();

  const miliknya = produk.filter((p) => p.umkmId === usaha.id);
  const akunnya = akun.filter((a) => a.umkmId === usaha.id);
  const tayang = miliknya.filter((p) => p.status.toLowerCase() === 'aktif');

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/kelola/umkm"
          className="font-body text-sm text-muted transition-colors hover:text-ink"
        >
          &larr; Semua pelaku usaha
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <Judul
            sub={
              <>
                /umkm/{usaha.slug} &middot; {LABEL_TATA_LETAK[usaha.tataLetak].nama},{' '}
                {namaTema(usaha.tema)}
                {usaha.status === 'nonaktif' && ' · nonaktif, halaman publiknya tidak bisa dibuka'}
              </>
            }
          >
            {usaha.nama}
          </Judul>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/kelola/umkm/${usaha.id}/halaman`}
              className="tekan flex min-h-11 items-center rounded-full bg-aksen px-6 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
            >
              Susun halaman
            </Link>
            <Link
              href={`/umkm/${usaha.slug}`}
              className="tekan flex min-h-11 items-center rounded-full border border-line px-6 font-body text-sm text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink"
            >
              Lihat halaman
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kartu angka={tayang.length} label="produk tayang" href={`/kelola/produk?umkm=${usaha.id}`} />
        <Kartu
          angka={miliknya.length - tayang.length}
          label="produk nonaktif"
          href={`/kelola/produk?umkm=${usaha.id}&status=nonaktif`}
        />
        <Kartu angka={akunnya.length} label="akun" href="/kelola/akun" />
        <Kartu angka={usaha.halaman.length || '—'} label="blok halaman" href={`/kelola/umkm/${usaha.id}/halaman`} />
      </div>

      <section>
        <Judul sub="Dipakai halaman publiknya, dan mengisi otomatis produk baru milik usaha ini.">
          Profil
        </Judul>
        <div className="mt-5">
          <FormProfilUmkm umkm={usaha} />
        </div>
      </section>

      <section>
        <Judul sub={`${miliknya.length} produk milik usaha ini`}>Produk</Judul>
        <div className="mt-4">
          {miliknya.length === 0 ? (
            <p className="rounded-kartu border border-dashed border-line bg-surface px-4 py-8 text-center font-body text-sm text-muted">
              Belum ada produk.{' '}
              <Link href="/kelola/produk" className="warna-interaktif text-ink underline underline-offset-4">
                Tambahkan yang pertama
              </Link>
              .
            </p>
          ) : (
            <>
              <ul className="divide-y divide-line overflow-hidden rounded-kartu border border-line">
                {miliknya.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="min-w-0 truncate font-body text-sm text-ink">{p.namaProduk}</span>
                    <span className="angka-rata shrink-0 font-body text-xs text-muted">
                      {formatRupiah(p.harga)}
                      {p.status.toLowerCase() !== 'aktif' && ' · nonaktif'}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/kelola/produk?umkm=${usaha.id}`}
                className="mt-3 inline-block font-body text-sm text-muted transition-colors hover:text-ink"
              >
                Kelola {miliknya.length} produk usaha ini &rarr;
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <Judul sub="Siapa saja yang bisa masuk dan mengubah usaha ini.">Akun</Judul>
        <div className="mt-4">
          {akunnya.length === 0 ? (
            <p className="rounded-kartu border border-dashed border-line bg-surface px-4 py-8 text-center font-body text-sm text-muted">
              Belum ada akun. Tanpa akun, pemiliknya tidak bisa mengurus tokonya sendiri.{' '}
              <Link href="/kelola/akun" className="warna-interaktif text-ink underline underline-offset-4">
                Buatkan akun
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-kartu border border-line">
              {akunnya.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="min-w-0 truncate font-body text-sm text-ink">{a.namaPengguna}</span>
                  <span className="shrink-0 font-body text-xs text-muted">
                    {a.status === 'nonaktif'
                      ? 'nonaktif'
                      : a.terakhirMasuk
                        ? `terakhir masuk ${new Date(a.terakhirMasuk).toLocaleDateString('id-ID')}`
                        : 'belum pernah masuk'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
