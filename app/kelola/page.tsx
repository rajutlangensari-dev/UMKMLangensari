import { wajibSesi } from '@/lib/sesi';
import { ambilProdukSemuaServer, ambilUmkmSemua } from '@/lib/backend';
import { Galat, Judul, Kartu, KartuAksi, Kosong, Urusan } from './Kotak';

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
        <BerandaAdmin produk={produk} umkm={umkm} />
      ) : (
        <BerandaUmkm produk={produk} umkm={umkm} umkmId={sesi.umkmId} />
      )}
    </div>
  );
}

type Produk = Awaited<ReturnType<typeof ambilProdukSemuaServer>>;
type DaftarUmkm = Awaited<ReturnType<typeof ambilUmkmSemua>>;

const aktif = (s: string) => s.toLowerCase() === 'aktif';

function BerandaAdmin({ produk, umkm }: { produk: Produk; umkm: DaftarUmkm }) {
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

  return (
    <>
      <section>
        <Judul sub="Angka di bawah dihitung ulang tiap halaman ini dibuka.">Keadaan portal</Judul>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Kartu
            angka={umkmAktif.length}
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
        <Judul>Perlu diurus</Judul>
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
        <Judul sub="Tiga hal yang paling sering dikerjakan dari sini.">Mulai dari sini</Judul>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <KartuAksi
            utama
            judul="Daftarkan usaha"
            jelas="Buat halaman baru beserta akun pemiliknya sekaligus."
            href="/kelola/umkm/baru"
          />
          <KartuAksi
            judul="Tambah produk"
            jelas="Pasang barang jualan untuk usaha mana pun."
            href="/kelola/produk"
          />
          <KartuAksi
            judul="Kelola akun"
            jelas="Atur siapa yang boleh masuk dan ganti kata sandinya."
            href="/kelola/akun"
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
}: {
  produk: Produk;
  umkm: DaftarUmkm;
  umkmId: string;
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

  return (
    <>
      <section>
        <Judul sub={`Halaman Anda ada di /umkm/${saya.slug}`}>{saya.nama}</Judul>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <Kartu
            angka={tayang.length}
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
