import { wajibSesi } from '@/lib/sesi';
import { ambilProdukSemuaServer, ambilUmkmSemua } from '@/lib/backend';
import { Galat, Judul, Kartu, KartuAksi, Kosong, Sapaan, Urusan } from './Kotak';

export const metadata = { title: 'Beranda panel' };

/**
 * Beranda panel. Isinya berbeda menurut peran, tapi keduanya menjawab satu
 * pertanyaan yang sama: apa yang perlu saya urus sekarang.
 *
 * Seluruh angka dihitung DI SERVER dari dua panggilan yang sudah dilakukan,
 * bukan lewat panggilan tambahan per kartu. Kuota Apps Script terbatas dan
 * dipakai bersama halaman publik.
 */
export default async function HalamanBeranda() {
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

  // Gagal memuat tidak mengosongkan halaman: pesannya tampil, sisanya tetap
  // dirender dengan angka nol. Halaman kosong tanpa keterangan terbaca sebagai
  // panel rusak, dan orang akan berhenti memakainya.
  return (
    <div className="space-y-8">
      {gagal && <Galat pesan={gagal} />}
      {superAdmin ? (
        <BerandaAdmin produk={produk} umkm={umkm} nama={sesi.namaPengguna} />
      ) : (
        <BerandaUmkm
          produk={produk}
          umkm={umkm}
          umkmId={sesi.umkmId}
          nama={sesi.namaPengguna}
        />
      )}
    </div>
  );
}

type Produk = Awaited<ReturnType<typeof ambilProdukSemuaServer>>;
type DaftarUmkm = Awaited<ReturnType<typeof ambilUmkmSemua>>;

const aktif = (s: string) => s.toLowerCase() === 'aktif';

function BerandaAdmin({
  produk,
  umkm,
  nama,
}: {
  produk: Produk;
  umkm: DaftarUmkm;
  nama: string;
}) {
  const umkmAktif = umkm.filter((u) => u.status === 'aktif');
  const tayang = produk.filter((p) => aktif(p.status));

  const yatim = produk.filter((p) => !p.umkmId);
  const tanpaProduk = umkmAktif.filter((u) => !produk.some((p) => p.umkmId === u.id));
  const tanpaFoto = umkmAktif.filter((u) => !u.foto.trim());
  // Halaman kosong berarti UMKM itu masih memakai susunan bawaan. Halamannya
  // tetap tayang penuh, tapi belum ada yang menyesuaikannya dengan usahanya.
  const halamanBawaan = umkmAktif.filter((u) => u.halaman.length === 0);

  const urusan = [
    yatim.length > 0 && {
      href: '/kelola/produk?pemilik=kosong',
      teks: `${yatim.length} produk belum terhubung dengan usaha`,
    },
    tanpaProduk.length > 0 && {
      href: '/kelola/umkm',
      teks: `${tanpaProduk.length} usaha belum memiliki produk`,
    },
    tanpaFoto.length > 0 && {
      href: '/kelola/umkm',
      teks: `${tanpaFoto.length} usaha belum memiliki foto profil`,
    },
    halamanBawaan.length > 0 && {
      href: '/kelola/umkm',
      teks: `${halamanBawaan.length} halaman usaha masih memakai susunan bawaan`,
    },
  ].filter(Boolean) as { href: string; teks: string }[];

  // Satu kalimat yang menyimpulkan keadaan, supaya angka-angka di bawahnya
  // punya konteks sebelum dibaca. Kalimatnya berubah menurut ada tidaknya
  // pekerjaan tertinggal — bukan basa-basi tetap yang lama-lama tidak dibaca.
  const ringkas =
    urusan.length === 0
      ? `Pengunjung dapat melihat ${umkmAktif.length} usaha dan ${tayang.length} produk. Semua data usaha aktif sudah lengkap.`
      : `Pengunjung dapat melihat ${umkmAktif.length} usaha dan ${tayang.length} produk. Periksa ${urusan.length} catatan di bawah.`;

  return (
    <>
      <Sapaan
        nama={nama}
        kalimat={ringkas}
        aksi={{ href: '/kelola/umkm/baru', label: 'Daftarkan usaha baru' }}
      />

      <section>
        <Judul sub="Ringkasan usaha dan produk yang tampil kepada pengunjung.">Keadaan portal</Judul>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Kartu
            angka={umkmAktif.length}
            dari={umkm.length}
            label="Usaha aktif"
            jelas="Pengunjung dapat membuka halaman usaha."
            href="/kelola/umkm"
          />
          <Kartu
            angka={umkm.length - umkmAktif.length}
            label="Usaha nonaktif"
            jelas="Portal menyimpan datanya tanpa menampilkannya."
            href="/kelola/umkm"
          />
          <Kartu
            angka={tayang.length}
            dari={produk.length}
            label="Produk tayang"
            jelas="Pengunjung dapat melihat dan menanyakan stoknya."
            href="/kelola/produk"
          />
          <Kartu
            angka={produk.length - tayang.length}
            label="Produk nonaktif"
            jelas="Portal menyimpan produk tanpa menampilkannya."
            href="/kelola/produk?status=nonaktif"
          />
        </div>
      </section>

      <section>
        {/* Jumlahnya ikut di judul, bukan cuma di daftarnya. Yang membuka panel
            sambil berdiri di teras orang lain butuh tahu berapa banyak sebelum
            memutuskan mulai atau tidak. */}
        <Judul sub={urusan.length > 0 ? `${urusan.length} hal menunggu` : undefined}>
          Perlu diurus
        </Judul>
        {urusan.length === 0 ? (
          <p className="mt-4 rounded-kartu border border-line bg-surface px-4 py-5 font-body text-sm text-muted">
            Tidak ada data usaha aktif yang perlu diperiksa.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {urusan.map((u) => (
              <Urusan key={u.teks} href={u.href} teks={u.teks} />
            ))}
          </ul>
        )}
      </section>

      <section>
        {/* "Daftarkan usaha" sengaja TIDAK diulang di sini — tombolnya sudah ada
            di kartu sambutan paling atas. Satu tautan yang muncul dua kali di
            layar yang sama membuat orang mengira keduanya mengerjakan hal
            berbeda, lalu ragu memilih yang mana. */}
        <Judul sub="Buka pekerjaan yang paling sering digunakan.">Akses cepat</Judul>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <KartuAksi
            utama
            judul="Tambah produk"
            jelas="Tambahkan produk untuk usaha yang terdaftar."
            href="/kelola/produk"
          />
          <KartuAksi
            judul="Kelola akun"
            jelas="Buat akun pemilik usaha dan kelola aksesnya."
            href="/kelola/akun"
          />
          <KartuAksi
            judul="Lihat situs publik"
            jelas="Periksa portal dari sisi pengunjung."
            href="/"
          />
        </div>
      </section>
    </>
  );
}

function BerandaUmkm({
  produk,
  umkm,
  umkmId,
  nama,
}: {
  produk: Produk;
  umkm: DaftarUmkm;
  umkmId: string;
  nama: string;
}) {
  // Penyaringan menurut peran dilakukan DI SINI, di server. Kalau dikerjakan di
  // browser, data usaha lain tetap terkirim ke sana dan tinggal dibuka lewat
  // alat pengembang.
  const saya = umkm.find((u) => u.id === umkmId);
  const milik = produk.filter((p) => p.umkmId === umkmId);
  const tayang = milik.filter((p) => aktif(p.status));

  if (!saya) {
    return (
      <Kosong
        judul="Akun ini belum terhubung ke usaha mana pun"
        jelas="Hubungi super admin portal supaya akun Anda ditautkan ke usaha yang benar."
      />
    );
  }

  const kurang = [
    !saya.foto.trim() && { href: '/kelola/profil', teks: 'Tambahkan foto profil usaha' },
    !saya.bio.trim() && { href: '/kelola/profil', teks: 'Jelaskan produk atau layanan yang Anda tawarkan' },
    !saya.kontakWa.trim() && {
      href: '/kelola/profil',
      teks: 'Tambahkan nomor WhatsApp agar pembeli dapat menghubungi Anda',
    },
    saya.halaman.length === 0 && {
      href: '/kelola/halaman',
      teks: 'Sesuaikan susunan halaman usaha',
    },
  ].filter(Boolean) as { href: string; teks: string }[];

  // Kalimatnya menyebut yang paling penting bagi pemilik usaha: berapa
  // barangnya yang sedang bisa dilihat pembeli. Bukan sapaan kosong.
  const ringkas =
    milik.length === 0
      ? 'Tambahkan produk pertama agar pembeli dapat melihat penawaran usaha Anda.'
      : kurang.length === 0
        ? `Pembeli dapat melihat dan menanyakan ${tayang.length} produk Anda. Profil usaha sudah lengkap.`
        : `Pembeli dapat melihat ${tayang.length} produk Anda. Lengkapi ${kurang.length} bagian profil di bawah.`;

  return (
    <>
      <Sapaan
        nama={nama}
        kalimat={ringkas}
        aksi={{ href: `/umkm/${saya.slug}`, label: 'Lihat halaman saya' }}
      />

      <section>
        <Judul sub={`Halaman Anda ada di /umkm/${saya.slug}`}>{saya.nama}</Judul>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <Kartu
            angka={tayang.length}
            dari={milik.length}
            label="Produk tayang"
            jelas="Pembeli dapat melihat dan menanyakan stoknya."
            href="/kelola/produk"
          />
          <Kartu
            angka={milik.length - tayang.length}
            label="Produk nonaktif"
            jelas="Produk tersimpan tanpa tampil di katalog."
            href="/kelola/produk"
          />
          <Kartu
            angka={saya.halaman.length || 'Bawaan'}
            label="Blok halaman"
            jelas={
              saya.halaman.length
                ? 'Susunan halaman Anda sendiri.'
                : 'Masih memakai susunan bawaan.'
            }
            href="/kelola/halaman"
          />
        </div>
      </section>

      {kurang.length > 0 && (
        <section>
          <Judul sub="Pilih bagian yang ingin Anda lengkapi.">
            Yang bisa dilengkapi
          </Judul>
          <ul className="mt-4 space-y-2.5">
            {kurang.map((k) => (
              <Urusan key={k.teks} href={k.href} teks={k.teks} />
            ))}
          </ul>
        </section>
      )}

      {milik.length === 0 && (
        <Kosong
          judul="Belum ada produk"
          jelas="Tambahkan foto, nama, dan harga produk pertama Anda."
          aksi={{ href: '/kelola/produk', label: 'Tambah produk pertama' }}
        />
      )}
    </>
  );
}
