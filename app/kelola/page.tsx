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
      teks: `${yatim.length} produk belum punya pemilik — tampil di katalog tapi tidak di halaman usaha mana pun`,
    },
    tanpaProduk.length > 0 && {
      href: '/kelola/umkm',
      teks: `${tanpaProduk.length} usaha belum punya produk sama sekali`,
    },
    tanpaFoto.length > 0 && {
      href: '/kelola/umkm',
      teks: `${tanpaFoto.length} usaha belum punya foto — halamannya jadi polos dan pratinjau WhatsApp-nya kosong`,
    },
    halamanBawaan.length > 0 && {
      href: '/kelola/umkm',
      teks: `${halamanBawaan.length} halaman usaha masih susunan bawaan, belum pernah disesuaikan`,
    },
  ].filter(Boolean) as { href: string; teks: string }[];

  // Satu kalimat yang menyimpulkan keadaan, supaya angka-angka di bawahnya
  // punya konteks sebelum dibaca. Kalimatnya berubah menurut ada tidaknya
  // pekerjaan tertinggal — bukan basa-basi tetap yang lama-lama tidak dibaca.
  const ringkas =
    urusan.length === 0
      ? `${umkmAktif.length} usaha dan ${tayang.length} produk sedang tayang. Tidak ada yang tertinggal hari ini.`
      : `${umkmAktif.length} usaha dan ${tayang.length} produk sedang tayang. Ada ${urusan.length} hal yang menunggu diurus di bawah.`;

  return (
    <>
      <Sapaan
        nama={nama}
        kalimat={ringkas}
        aksi={{ href: '/kelola/umkm/baru', label: 'Daftarkan usaha baru' }}
      />

      <section>
        <Judul sub="Dihitung ulang tiap halaman ini dibuka.">Keadaan portal</Judul>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Kartu
            angka={umkmAktif.length}
            dari={umkm.length}
            label="Usaha aktif"
            jelas="Halamannya tayang dan bisa dibuka pengunjung."
            href="/kelola/umkm"
          />
          <Kartu
            angka={umkm.length - umkmAktif.length}
            label="Usaha nonaktif"
            jelas="Tidak muncul di situs sampai diaktifkan lagi."
            href="/kelola/umkm"
          />
          <Kartu
            angka={tayang.length}
            dari={produk.length}
            label="Produk tayang"
            jelas="Terlihat di katalog dan bisa dipesan lewat WhatsApp."
            href="/kelola/produk"
          />
          <Kartu
            angka={produk.length - tayang.length}
            label="Produk nonaktif"
            jelas="Tersimpan tapi disembunyikan dari pengunjung."
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
            Tidak ada yang tertinggal. Semua usaha punya foto, produk, dan halamannya sendiri.
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
        <Judul sub="Tiga hal yang paling sering dikerjakan dari sini.">Mulai dari sini</Judul>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <KartuAksi
            utama
            judul="Tambah produk"
            jelas="Pasang barang jualan untuk usaha mana pun."
            href="/kelola/produk"
          />
          <KartuAksi
            judul="Kelola akun"
            jelas="Atur siapa yang boleh masuk dan ganti kata sandinya."
            href="/kelola/akun"
          />
          <KartuAksi
            judul="Lihat situs publik"
            jelas="Periksa tampilannya seperti yang dilihat pembeli."
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
    !saya.foto.trim() && { href: '/kelola/profil', teks: 'Pasang foto usaha — halaman Anda masih polos' },
    !saya.bio.trim() && { href: '/kelola/profil', teks: 'Tulis keterangan usaha supaya pembeli tahu Anda menjual apa' },
    !saya.kontakWa.trim() && {
      href: '/kelola/profil',
      teks: 'Isi nomor WhatsApp — tanpa itu tombol pesan tidak muncul di halaman Anda',
    },
    saya.halaman.length === 0 && {
      href: '/kelola/halaman',
      teks: 'Susun halaman Anda sendiri — sekarang masih memakai susunan bawaan',
    },
  ].filter(Boolean) as { href: string; teks: string }[];

  // Kalimatnya menyebut yang paling penting bagi pemilik usaha: berapa
  // barangnya yang sedang bisa dilihat pembeli. Bukan sapaan kosong.
  const ringkas =
    milik.length === 0
      ? 'Halaman usaha Anda sudah tayang, tapi belum ada produk di dalamnya. Satu produk berfoto sudah cukup untuk memulai.'
      : kurang.length === 0
        ? `${tayang.length} produk Anda sedang bisa dilihat dan dipesan pembeli. Halaman Anda sudah lengkap.`
        : `${tayang.length} produk Anda sedang bisa dilihat pembeli. Ada ${kurang.length} hal yang masih bisa dilengkapi di bawah.`;

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
            jelas="Terlihat pembeli dan bisa dipesan lewat WhatsApp."
            href="/kelola/produk"
          />
          <Kartu
            angka={milik.length - tayang.length}
            label="Produk nonaktif"
            jelas="Tersimpan tapi belum ditampilkan."
            href="/kelola/produk"
          />
          <Kartu
            angka={saya.halaman.length || '—'}
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
          <Judul sub="Semuanya bisa dikerjakan dari panel ini, tidak perlu menghubungi siapa pun.">
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
          jelas="Pasang satu produk berfoto dulu. Cukup foto, nama, dan harga — sisanya bisa menyusul kapan saja."
          aksi={{ href: '/kelola/produk', label: 'Tambah produk pertama' }}
        />
      )}
    </>
  );
}
