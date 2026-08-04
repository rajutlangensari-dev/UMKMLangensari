import Link from 'next/link';

/**
 * Potongan tampilan yang dipakai berulang di panel.
 *
 * Ada di satu berkas supaya jarak, sudut, dan nada tulisan tidak diputuskan
 * ulang di sepuluh halaman lalu meleset di salah satunya.
 */

/**
 * Kartu angka di dasbor.
 *
 * Memakai `.kartu-hover` yang sama persis dengan kartu di situs publik. Panel
 * dan situs publik dipakai orang yang sama dalam satu duduk — dua bahasa kartu
 * yang berbeda membuat panel terasa seperti aplikasi lain yang kebetulan
 * ditempel di alamat yang sama.
 *
 * `jelas` adalah satu baris yang menerangkan apa arti angkanya. Sebelumnya
 * kartu ini cuma angka + label dua kata ("14 produk tayang"), dan yang membaca
 * harus menebak sendiri apakah itu bagus atau buruk.
 */
export function Kartu({
  angka,
  label,
  jelas,
  href,
  dari,
}: {
  angka: number | string;
  label: string;
  jelas?: string;
  href?: string;
  /** Totalnya, kalau angka di atas adalah bagian dari sesuatu. Menggambar bilah proporsi. */
  dari?: number;
}) {
  // Bilah proporsi, bukan diagram.
  //
  // "48 produk tayang" dan "4 produk nonaktif" berdiri sebagai dua angka lepas
  // yang harus dibandingkan sendiri di kepala. Satu bilah menjawabnya seketika:
  // hampir penuh berarti hampir semuanya tayang. Digambar dengan satu div
  // berlebar persen — tanpa pustaka diagram, yang untuk satu perbandingan
  // sederhana berarti menambah beban unduh demi sesuatu yang bisa dilihat
  // dalam sekali pandang.
  //
  // Tidak digambar saat angkanya SAMA dengan totalnya. "24 dari 24" beserta
  // bilah penuh tidak menambah apa pun di atas "24", dan kartu yang selalu
  // menampilkan hiasan yang sama berhenti dibaca. Bilahnya muncul justru saat
  // ada yang tertinggal — persis saat ia berguna.
  const bagian =
    typeof dari === 'number' && dari > 0 && typeof angka === 'number' && angka < dari
      ? Math.round((angka / dari) * 100)
      : null;

  const isi = (
    <>
      {/* Tabular-nums supaya deretan angka sejajar dan tidak bergeser saat
          nilainya berubah setelah menyegar. */}
      <span className="angka-rata block font-display text-3xl font-bold tracking-[-0.02em] text-ink">
        {angka}
        {bagian !== null && (
          <span className="ml-1.5 font-body text-sm sm:text-xs font-semibold text-muted">dari {dari}</span>
        )}
      </span>
      <span className="kartu-hover-judul mt-1.5 block font-display text-base font-semibold leading-snug text-ink sm:text-sm">
        {label}
      </span>
      {jelas && (
        <span className="mt-1 block font-body text-sm leading-relaxed text-muted text-pretty sm:text-xs">
          {jelas}
        </span>
      )}
      {bagian !== null && (
        <span
          role="img"
          aria-label={`${bagian} persen dari ${dari}`}
          className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-line"
        >
          <span
            className="block h-full rounded-full bg-aksen-kuat"
            style={{ width: `${bagian}%` }}
          />
        </span>
      )}
    </>
  );
  const kelas = 'kartu-hover rounded-kartu border border-line bg-surface px-4 py-4 sm:px-5 sm:py-5';
  return href ? (
    <Link href={href} className={`${kelas} block`}>
      {isi}
    </Link>
  ) : (
    <div className={kelas}>{isi}</div>
  );
}

/**
 * Kartu tindakan: satu langkah yang bisa langsung dikerjakan.
 *
 * Menggantikan barisan pil di bagian "Mulai dari sini". Tiga pil sebaris terbaca
 * sebagai tiga tombol yang setara padahal yang pertama jauh lebih penting
 * daripada yang ketiga, dan di HP ketiganya membungkus jadi susunan yang
 * berubah-ubah menurut lebar layar.
 */
export function KartuAksi({
  judul,
  jelas,
  href,
  utama,
}: {
  judul: string;
  jelas: string;
  href: string;
  utama?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`kartu-hover flex flex-col rounded-kartu border px-5 py-5 ${
        utama ? 'border-aksen-kuat bg-aksen-kuat/[0.06]' : 'border-line bg-surface'
      }`}
    >
      <span className="kartu-hover-judul font-display text-base font-semibold text-ink sm:text-sm">
        {judul}
      </span>
      <span className="mt-1.5 font-body text-sm leading-relaxed text-muted text-pretty sm:text-xs">
        {jelas}
      </span>
    </Link>
  );
}

/**
 * Salam menurut jam, dihitung di WIB.
 *
 * `new Date().getHours()` di sini adalah jam SERVER, dan servernya (Vercel)
 * berjalan di UTC — pukul 08.00 di Langensari akan disambut "Selamat malam".
 * Jadi zonanya digeser secara terang-terangan, bukan diserahkan ke setelan
 * mesin yang berbeda antara laptop pengembang dan server.
 *
 * Sengaja tidak dihitung di peramban: itu berarti sapaan berubah setelah
 * halaman muncul, dan kalimat pertama yang berkedip ganti adalah hal pertama
 * yang dilihat orang tiap kali membuka panel.
 */
export function salam(): string {
  const jam = new Date(Date.now() + 7 * 60 * 60 * 1000).getUTCHours();
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/**
 * Kartu sambutan di puncak dasbor.
 *
 * Gunanya bukan hiasan: sebelumnya halaman ini dibuka langsung dengan empat
 * kotak angka, dan yang membaca harus menerjemahkan sendiri angka-angka itu
 * jadi "keadaan portal baik-baik saja" atau "ada yang perlu dikerjakan".
 * Kartu ini mengatakannya dengan kalimat lebih dulu, angkanya menyusul di
 * bawah sebagai rinciannya.
 *
 * Satu tombol saja. Dua tombol sejajar di kartu paling atas membuat orang
 * berhenti untuk memilih, padahal ini halaman yang dibuka setiap hari.
 */
export function Sapaan({
  nama,
  kalimat,
  aksi,
}: {
  nama: string;
  kalimat: string;
  aksi?: { href: string; label: string };
}) {
  return (
    <section className="sapaan rounded-kartu border border-line px-5 py-6 sm:px-7 sm:py-7">
      <p className="font-body text-base text-muted sm:text-sm">{salam()},</p>
      <h2 className="mt-0.5 font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">
        {nama}
      </h2>
      <p className="mt-2.5 max-w-prose font-body text-base leading-relaxed text-muted text-pretty sm:text-sm">
        {kalimat}
      </p>
      {aksi && (
        <Link
          href={aksi.href}
          className="tekan mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-aksen px-6 font-body text-base font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat sm:inline-flex sm:min-h-11 sm:w-auto sm:text-sm"
        >
          {aksi.label}
        </Link>
      )}
    </section>
  );
}

export function Judul({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-lg">{children}</h2>
      {sub && <p className="mt-1 font-body text-base leading-relaxed text-muted text-pretty sm:text-sm">{sub}</p>}
    </div>
  );
}

export function Galat({ pesan }: { pesan: string }) {
  return (
    <p
      role="alert"
      className="rounded-kartu border border-line bg-surface p-4 font-body text-base text-ink sm:text-sm"
    >
      {pesan}
    </p>
  );
}

/**
 * Keadaan kosong.
 *
 * Selalu menyebut LANGKAH BERIKUTNYA, tidak pernah cuma "belum ada apa-apa".
 * Nadanya mengajak: orang yang baru pertama membuka panel dan langsung disambut
 * ruang kosong akan menyimpulkan dirinya salah, bukan bahwa memang belum ada
 * isinya.
 */
export function Kosong({
  judul,
  jelas,
  aksi,
}: {
  judul: string;
  jelas: string;
  aksi?: { href?: string; label: string; onClick?: () => void };
}) {
  return (
    <div className="rounded-kartu border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-ink">{judul}</p>
      <p className="mx-auto mt-2 max-w-sm font-body text-base leading-relaxed text-muted text-pretty sm:text-sm">
        {jelas}
      </p>
      {aksi?.href && (
        <Link
          href={aksi.href}
          className="tekan mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-aksen px-6 font-body text-base font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat sm:inline-flex sm:min-h-11 sm:w-auto sm:text-sm"
        >
          {aksi.label}
        </Link>
      )}
    </div>
  );
}

/** Satu butir di daftar "perlu diurus". Selalu tertaut ke tempat memperbaikinya. */
export function Urusan({ href, teks }: { href: string; teks: string }) {
  return (
    <li>
      <Link
        href={href}
        className="tekan group flex min-h-12 items-center justify-between gap-4 rounded-kartu border border-line bg-surface px-4 py-3 transition-colors hover:border-aksen"
      >
        <span className="warna-interaktif font-body text-base text-ink text-pretty sm:text-sm">{teks}</span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className="h-3 w-3 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5"
        >
          <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
      </Link>
    </li>
  );
}
