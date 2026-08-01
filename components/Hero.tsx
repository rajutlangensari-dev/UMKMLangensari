'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Produk, SorotanUsaha } from '@/lib/types';
import { formatRupiah, normalisasiFotoUrl } from '@/lib/api';
import { useKurangiGerak } from '@/lib/gerak';

/**
 * Sorotan pelaku usaha di halaman muka.
 *
 * YANG DISOROT SEKARANG ORANGNYA, BUKAN BARANGNYA. Versi sebelumnya memutar
 * lima produk lepas: pengunjung melihat lima foto bagus tanpa pernah tahu siapa
 * yang membuatnya, padahal justru itu yang membedakan portal desa dari
 * marketplace mana pun. Sekarang tiap slide satu usaha — foto, nama, satu
 * kalimat tentang dirinya, kampungnya — dan empat barangnya di bawahnya, di
 * dalam sorotan yang sama.
 *
 * Lebarnya penuh dari kiri ke kanan. Latarnya menyentuh kedua tepi layar
 * sehingga bagian ini terbaca sebagai satu ruang tersendiri, bukan kartu yang
 * mengambang; isinya tetap dibatasi supaya barisan teksnya tidak jadi terlalu
 * panjang untuk dibaca di layar lebar.
 *
 * SATU ATURAN YANG MENENTUKAN SELURUH BERKAS INI: yang memegang posisi adalah
 * ELEMEN GULIRNYA, bukan state React.
 *
 * Versi sebelumnya menyimpan `aktif` di state lalu memasang efek yang menggulir
 * rel setiap kali `aktif` berubah — sementara `onScroll` juga menulis balik ke
 * `aktif` dari posisi gulir. Dua arah itu membentuk lingkaran: pengguna
 * menggeser → onScroll → setAktif → efek menggulir balik ke posisi bulat
 * terdekat → onScroll lagi. Di trackpad, geseran pelan tersentak kembali ke
 * slide sebelumnya di tengah jalan.
 *
 * Sekarang alirannya satu arah:
 *   tombol / indikator / autoplay  ->  rel.scrollTo()  ->  onScroll  ->  aktif
 * `aktif` hanya untuk menyalakan indikator dan mengumumkan ke pembaca layar.
 */

const INTERVAL_OTOMATIS = 7000;

export default function Hero({ sorotan }: { sorotan: SorotanUsaha[] }) {
  const relRef = useRef<HTMLDivElement>(null);
  const bingkaiRef = useRef<HTMLDivElement>(null);
  const [aktif, setAktif] = useState(0);
  const [dijeda, setDijeda] = useState(false);
  const [terlihat, setTerlihat] = useState(true);
  const [pernahDiatur, setPernahDiatur] = useState(false);
  const kurangiGerak = useKurangiGerak();

  const jumlah = sorotan.length;

  const keSlide = useCallback(
    (indeks: number, manual = false) => {
      const rel = relRef.current;
      if (!rel || jumlah < 2) return;
      const tujuan = (indeks + jumlah) % jumlah;
      rel.scrollTo({
        left: rel.clientWidth * tujuan,
        behavior: kurangiGerak ? 'auto' : 'smooth',
      });
      if (manual) setPernahDiatur(true);
      // `aktif` sengaja TIDAK disetel di sini. Ia menyusul lewat onScroll, jadi
      // indikator selalu memberitahukan posisi rel yang sebenarnya — termasuk
      // kalau gulirannya dipotong pengguna di tengah jalan.
    },
    [jumlah, kurangiGerak]
  );

  // Posisi rel dibaca di frame berikutnya, bukan tiap peristiwa scroll. Gulir
  // halus memicu puluhan peristiwa per detik; menyetel state pada tiap
  // peristiwa berarti puluhan render yang menghasilkan angka yang sama.
  const gulirTertunda = useRef(0);
  const ikutiGulir = useCallback(() => {
    if (gulirTertunda.current) return;
    gulirTertunda.current = window.requestAnimationFrame(() => {
      gulirTertunda.current = 0;
      const rel = relRef.current;
      if (!rel || !rel.clientWidth) return;
      const indeks = Math.round(rel.scrollLeft / rel.clientWidth);
      setAktif(Math.min(jumlah - 1, Math.max(0, indeks)));
    });
  }, [jumlah]);

  useEffect(() => () => {
    if (gulirTertunda.current) window.cancelAnimationFrame(gulirTertunda.current);
  }, []);

  // Autoplay hanya berjalan kalau SEMUA syaratnya terpenuhi: bukan reduced
  // motion, belum pernah diatur sendiri, tidak sedang disentuh/di-hover, dan
  // hero-nya benar-benar terlihat di layar. Syarat terakhir yang paling sering
  // dilupakan — tanpa itu, timer terus berdetak dan menggulir hero yang sudah
  // jauh di atas layar, membuang baterai untuk gerak yang tidak dilihat siapa pun.
  //
  // Jedanya 7 detik, lebih panjang dari versi produk. Satu slide sekarang berisi
  // profil usaha DAN empat barangnya; berpindah sebelum orangnya sempat membaca
  // nama usahanya membuat sorotan ini kehilangan seluruh maksudnya.
  useEffect(() => {
    if (jumlah < 2 || dijeda || pernahDiatur || kurangiGerak || !terlihat) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const rel = relRef.current;
      if (!rel || !rel.clientWidth) return;
      const sekarang = Math.round(rel.scrollLeft / rel.clientWidth);
      keSlide(sekarang + 1);
    }, INTERVAL_OTOMATIS);

    return () => window.clearInterval(timer);
  }, [dijeda, pernahDiatur, jumlah, kurangiGerak, terlihat, keSlide]);

  // Tab yang disembunyikan tidak cuma dilewati, timernya benar-benar dilepas.
  useEffect(() => {
    const ubah = () => setTerlihat(!document.hidden);
    document.addEventListener('visibilitychange', ubah);
    return () => document.removeEventListener('visibilitychange', ubah);
  }, []);

  // Hero yang tergulir keluar layar menghentikan timernya.
  useEffect(() => {
    const bingkai = bingkaiRef.current;
    if (!bingkai || typeof IntersectionObserver === 'undefined') return;
    const pengamat = new IntersectionObserver(
      ([masuk]) => setTerlihat(masuk.isIntersecting && !document.hidden),
      { threshold: 0.25 }
    );
    pengamat.observe(bingkai);
    return () => pengamat.disconnect();
  }, [jumlah]);

  if (jumlah === 0) return <HeroKosong />;

  if (jumlah === 1) {
    return (
      <section className="hero-penuh">
        <h1 className="sr-only">UMKM Langensari</h1>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <IsiSorotan usaha={sorotan[0]} utama />
        </div>
      </section>
    );
  }

  return (
    <section className="hero-penuh">
      <h1 className="sr-only">UMKM Langensari</h1>
      <div
        ref={bingkaiRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Sorotan pelaku usaha"
        onMouseEnter={() => setDijeda(true)}
        onMouseLeave={() => setDijeda(false)}
        onFocusCapture={() => setDijeda(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDijeda(false);
        }}
      >
        <p className="sr-only" aria-live="polite">
          Sorotan {aktif + 1} dari {jumlah}: {sorotan[aktif]?.nama}
        </p>

        <div
          ref={relRef}
          className="hero-rel"
          onScroll={ikutiGulir}
          // Menyentuh berarti orangnya sedang mengendalikan sendiri. Setelah itu
          // timer tidak mengambil alih lagi pada kunjungan ini — carousel yang
          // bergerak sendiri tepat saat jari hendak menekan tombol adalah salah
          // satu cara tercepat membuat orang salah tekan.
          onPointerDown={() => setPernahDiatur(true)}
        >
          {sorotan.map((usaha, indeks) => (
            <article
              key={usaha.slug}
              className="hero-slide"
              aria-roledescription="slide"
              aria-label={`${indeks + 1} dari ${jumlah}: ${usaha.nama}`}
            >
              <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <IsiSorotan usaha={usaha} utama={indeks === 0} />
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center justify-between gap-4 border-t border-line py-3">
            <div className="flex items-center gap-0.5" role="group" aria-label="Pilih pelaku usaha">
              {sorotan.map((usaha, indeks) => (
                <button
                  key={usaha.slug}
                  type="button"
                  onClick={() => keSlide(indeks, true)}
                  aria-label={`Tampilkan ${usaha.nama}`}
                  aria-current={aktif === indeks ? 'true' : undefined}
                  className={`hero-indikator tekan ${aktif === indeks ? 'is-aktif' : ''}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => keSlide(aktif - 1, true)}
                aria-label="Pelaku usaha sebelumnya"
                className="hero-kontrol tekan"
              >
                <Panah arah="kiri" />
              </button>
              <button
                type="button"
                onClick={() => keSlide(aktif + 1, true)}
                aria-label="Pelaku usaha berikutnya"
                className="hero-kontrol tekan"
              >
                <Panah arah="kanan" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Isi satu sorotan: profil usahanya di atas, empat barangnya di bawah.
 *
 * `utama` menandai slide pertama — satu-satunya yang fotonya pantas diberi
 * prioritas muat. Memberi `fetchPriority="high"` ke seluruh slide justru
 * membatalkan maksudnya: kalau semuanya penting, tidak ada yang didahulukan,
 * dan peramban tetap mengunduh empat foto yang belum kelihatan lebih dulu.
 */
function IsiSorotan({ usaha, utama }: { usaha: SorotanUsaha; utama: boolean }) {
  const potret = normalisasiFotoUrl(usaha.foto, 256);
  const produk = usaha.produk.slice(0, 4);

  return (
    // Di layar lebar, profil dan barangnya BERDAMPINGAN, bukan bertumpuk.
    // Bertumpuk membuat sorotan ini setinggi hampir dua layar penuh: orang harus
    // menggulir melewati satu profil sebelum melihat barang pertama, padahal
    // barangnya yang membuat mereka berhenti. Berdampingan, keduanya masuk dalam
    // satu layar dan halamannya langsung terasa seperti katalog, bukan profil.
    //
    // Di HP tetap bertumpuk — dua kolom selebar 180 px tidak menolong siapa pun.
    <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-center lg:gap-12">
      <div className="flex items-center gap-4 sm:gap-5 lg:block">
        <div className="hero-potret shrink-0 lg:mb-5">
          {potret ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={potret}
              alt=""
              fetchPriority={utama ? 'high' : undefined}
              loading={utama ? 'eager' : 'lazy'}
              className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper font-display text-2xl font-bold text-aksen sm:h-20 sm:w-20">
              {usaha.nama.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-body text-xs font-semibold uppercase tracking-label text-aksen">
            Sorotan usaha warga
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-ink text-balance sm:text-3xl">
            {usaha.nama}
          </h2>
          {usaha.bio && (
            <p className="mt-2 font-body text-sm leading-relaxed text-muted text-pretty">
              {/* Satu kalimat pembuka, bukan seluruh bio. Bio panjang di sorotan
                  mendorong barangnya turun sampai keluar layar — padahal
                  barangnya yang membuat orang mengetuk. Selebihnya ada di
                  halaman usahanya. */}
              {usaha.bio.trim().split(/\n/)[0]?.slice(0, 120)}
            </p>
          )}
          {/* Alamat sengaja TIDAK ditampilkan di sini. Di sorotan ia cuma satu
              baris abu-abu tambahan yang mendorong tombol turun, dan tidak ada
              yang memutuskan mau melihat sebuah usaha karena nama kampungnya.
              Ia tetap ada di halaman usahanya, di blok kontak, tempat orang
              memang sedang mencarinya. */}
          {/* SATU ajakan, dan sengaja yang ini.
              ------------------------------------------------------------
              Tombol kedua dulu berbunyi "Semua produknya" — dan itu justru
              mengulang apa yang sudah dikerjakan empat foto di sebelahnya.
              Tiap til itu sendiri sudah tautan ke barangnya; orang yang mau
              melihat barang tidak butuh tombol untuk itu, ia tinggal mengetuk
              fotonya.

              Yang TIDAK bisa dilakukan til-til itu adalah membawa orang ke
              usahanya: ceritanya, galerinya, jam bukanya, nomor WhatsApp-nya.
              Jadi satu-satunya ajakan di sini menuju ke sana — dan halaman itu
              memuat tombol katalog lengkapnya sendiri, jadi tidak ada jalan
              yang hilang, cuma satu keputusan yang tidak perlu diambil di
              halaman muka. */}
          <div className="mt-5">
            <Link
              href={`/umkm/${usaha.slug}`}
              className="tekan inline-flex min-h-11 items-center rounded-full bg-aksen px-7 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
            >
              Lihat profil usahanya
            </Link>
          </div>
        </div>
      </div>

      {produk.length > 0 && (
        <div className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          {/* Tanpa judul dan tanpa tautan "Lihat semua". Keduanya sudah dibuang:
              judulnya cuma mengulang nama usaha yang tertulis besar di
              sebelahnya, dan tautannya adalah ajakan KEDUA — persis yang tidak
              boleh ada di sini. Yang tersisa empat foto yang masing-masing
              sudah jadi tautan ke barangnya sendiri. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {produk.map((p) => (
              <TilProduk key={p.id} produk={p} utama={utama} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Kartu produk versi ringkas untuk di dalam sorotan.
 *
 * Sengaja BUKAN `KartuProduk`. Kartu katalog membawa tombol "Pesan" ke
 * WhatsApp, dan menaruh empat tombol pesan di halaman muka membuat hero bersaing
 * dengan katalognya sendiri — sementara ajakan yang sebenarnya di sini adalah
 * mengenal usahanya. Ia juga membawa animasi masuk bertahap yang, dikalikan
 * lima slide, berarti dua puluh kartu beranimasi sekaligus saat halaman dibuka,
 * sebagian besar di slide yang belum terlihat.
 */
function TilProduk({ produk, utama }: { produk: Produk; utama: boolean }) {
  const foto = normalisasiFotoUrl(produk.foto, 480);

  return (
    <Link
      href={`/produk/${produk.id}`}
      // `kartu-hover` sama persis dengan yang dipakai kartu keterangan di bawah
      // sorotan: menebal lewat `box-shadow: inset` dan terangkat 3px, tanpa
      // menggeser tata letak. `angkat` sengaja TIDAK dipasang lagi — keduanya
      // menggerakkan `transform` pada elemen yang sama dan yang belakangan
      // menang, jadi salah satunya cuma jadi kode mati yang membingungkan.
      className="kartu-hover group block overflow-hidden rounded-kartu border border-line bg-paper"
    >
      <div className="overflow-hidden bg-surface">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={produk.namaProduk}
            loading={utama ? 'eager' : 'lazy'}
            className="zoom-produk aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center">
            <span className="font-display text-2xl font-bold text-muted/50">
              {produk.namaProduk.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3">
        <p className="kartu-hover-judul line-clamp-2 font-display text-xs font-semibold leading-snug text-ink sm:text-sm">
          {produk.namaProduk}
        </p>
        <p className="mt-1 font-display text-xs font-bold text-ink sm:text-sm">
          {formatRupiah(produk.harga)}
        </p>
      </div>
    </Link>
  );
}

/**
 * Beranda saat backend tidak menjawab atau belum ada usaha berproduk.
 *
 * Tetap merender ajakan yang benar, bukan pesan galat. Halaman muka yang utuh
 * tanpa sorotan jauh lebih baik daripada halaman muka yang memberitahukan
 * kegagalan sistem kepada calon pembeli.
 */
function HeroKosong() {
  return (
    <section className="hero-penuh">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="max-w-2xl font-display text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-ink text-balance sm:text-4xl">
          Cari produk buatan warga Langensari
        </h1>
        <p className="mt-3 max-w-xl font-body leading-relaxed text-muted text-pretty">
          Lihat produknya, cek harga, dan kenali siapa yang membuatnya. Kalau ada yang cocok,
          hubungi usahanya langsung lewat WhatsApp.
        </p>
        {/* Satu ajakan juga di sini, sama seperti sorotannya. Kalau sampai
            keadaan ini yang muncul, berarti tidak ada usaha berproduk yang bisa
            ditampilkan — dan menawarkan dua pilihan kepada orang yang baru saja
            mendarat di halaman yang gagal memuat isinya cuma menambah beban.
            Katalog, bukan daftar pelaku usaha: yang dicari orang barangnya. */}
        <div className="mt-6">
          <Link
            href="/katalog"
            className="tekan inline-flex min-h-11 items-center rounded-full bg-aksen px-7 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
          >
            Jelajahi katalog
          </Link>
        </div>
      </div>
    </section>
  );
}

function Panah({ arah }: { arah: 'kiri' | 'kanan' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d={arah === 'kiri' ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
