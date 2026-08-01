import Link from 'next/link';
import { sorotProduk, type BlokKatalog } from '@/lib/blok';
import { Bagian, JudulBagian } from './Blok';
import type { KonteksBlok } from './Blok';
import KatalogIsi from './KatalogIsi';
import { tautanWhatsapp } from '@/lib/api';

/**
 * Sorotan barang yang dijual usaha ini, di halaman profilnya.
 *
 * SENGAJA TIDAK MEMUAT SEMUANYA. Halaman ini profil; daftar lengkapnya ada di
 * `/umkm/<slug>/katalog` dengan pencarian dan saringan kategori. Usaha dengan 40
 * produk yang menumpahkan semuanya di sini membuat kontak dan ceritanya
 * terkubur sejauh belasan gulir ke bawah, sementara orang yang mencari satu
 * barang tertentu tetap tidak punya kolom pencarian.
 *
 * Produknya TIDAK diambil ulang di sini. Ia sudah ada di konteks, hasil satu
 * pengambilan di halaman induknya, lalu disaring menurut pemiliknya. Kalau tiap
 * blok mengambil sendiri, halaman dengan dua blok katalog menembak backend dua
 * kali untuk data yang sama persis — dan kuota Apps Script bukan milik kita.
 */
export default function Katalog({ blok, konteks }: { blok: BlokKatalog; konteks: KonteksBlok }) {
  const { produk, produkGagal, umkm } = konteks;

  const terpakai = sorotProduk(produk, blok.batas);
  const kategori = Array.from(new Set(terpakai.map((p) => p.kategori).filter(Boolean)));

  return (
    <Bagian
      anak={
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <JudulBagian>{blok.judul || 'Produk'}</JudulBagian>
            {produk.length > 0 && (
              // Jumlah SELURUH produknya, bukan yang kebetulan tampil di sorotan.
              // Angka yang menghitung sorotan membuat toko berisi 25 barang
              // terbaca seperti toko berisi 8.
              <p className="angka-rata font-body text-sm text-muted">{produk.length} produk</p>
            )}
          </div>

          {produkGagal ? (
            <p className="mt-8 rounded-kartu border border-line bg-surface p-6 font-body text-sm text-ink">
              Produk gagal dimuat. Periksa sambungan internet, lalu muat ulang halaman.
            </p>
          ) : terpakai.length === 0 ? (
            <div className="mt-8 rounded-kartu border border-line bg-surface p-8 text-center">
              <p className="font-body leading-relaxed text-muted text-pretty">
                Belum ada produk yang ditampilkan di sini.
              </p>
              {umkm.kontakWa && (
                <a
                  href={tautanWhatsapp(umkm.kontakWa, `produk ${umkm.nama}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tekan mt-5 inline-block rounded-full bg-aksen px-6 py-2.5 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
                >
                  Tanya lewat WhatsApp
                </a>
              )}
            </div>
          ) : (
            <>
              <KatalogIsi
                produk={terpakai}
                kategori={kategori}
                kategoriAwal={blok.kategoriAwal}
              />
              {/* Selalu tampil, juga saat sorotannya sudah memuat semua produk.
                  Halaman katalognya menawarkan hal yang tidak ada di sini —
                  pencarian, saringan yang tercatat di alamat, dan satu tautan
                  yang bisa dikirim apa adanya — jadi ia tetap tujuan yang sah
                  buat toko berisi tiga barang. Menyembunyikannya juga membuat
                  halaman itu tidak punya satu pun tautan masuk. */}
              <div className="mt-8 text-center">
                <Link
                  href={`/umkm/${umkm.slug}/katalog`}
                  className="tekan inline-flex min-h-11 items-center rounded-full border border-line px-6 font-body text-sm font-semibold text-ink transition-[transform,border-color,background-color] duration-150 ease-out hover:border-aksen hover:bg-surface"
                >
                  Lihat katalog lengkap
                  <span className="angka-rata ml-2 font-normal text-muted">
                    {produk.length} produk
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      }
    />
  );
}
