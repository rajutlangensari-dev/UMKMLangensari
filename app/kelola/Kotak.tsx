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
}: {
  angka: number | string;
  label: string;
  jelas?: string;
  href?: string;
}) {
  const isi = (
    <>
      {/* Tabular-nums supaya deretan angka sejajar dan tidak bergeser saat
          nilainya berubah setelah menyegar. */}
      <span className="angka-rata block font-display text-3xl font-bold tracking-[-0.02em] text-ink">
        {angka}
      </span>
      <span className="kartu-hover-judul mt-1.5 block font-display text-sm font-semibold leading-snug text-ink">
        {label}
      </span>
      {jelas && (
        <span className="mt-1 block font-body text-xs leading-relaxed text-muted text-pretty">
          {jelas}
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
      <span className="kartu-hover-judul font-display text-sm font-semibold text-ink">
        {judul}
      </span>
      <span className="mt-1.5 font-body text-xs leading-relaxed text-muted text-pretty">
        {jelas}
      </span>
    </Link>
  );
}

export function Judul({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">{children}</h2>
      {sub && <p className="mt-1 font-body text-sm text-muted text-pretty">{sub}</p>}
    </div>
  );
}

export function Galat({ pesan }: { pesan: string }) {
  return (
    <p
      role="alert"
      className="rounded-kartu border border-line bg-surface p-4 font-body text-sm text-ink"
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
      <p className="mx-auto mt-2 max-w-sm font-body text-sm leading-relaxed text-muted text-pretty">
        {jelas}
      </p>
      {aksi?.href && (
        <Link
          href={aksi.href}
          className="tekan mt-6 inline-flex min-h-11 items-center rounded-full bg-aksen px-6 font-body text-sm font-semibold text-aksen-ink transition-[transform,background-color] duration-150 ease-out hover:bg-aksen-kuat"
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
        className="tekan group flex min-h-11 items-center justify-between gap-4 rounded-kartu border border-line bg-surface px-4 py-3 transition-colors hover:border-aksen"
      >
        <span className="warna-interaktif font-body text-sm text-ink text-pretty">{teks}</span>
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
