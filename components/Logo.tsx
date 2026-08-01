/**
 * Logo portal: ikon tas dagang + wordmark UMKM LANGENSARI.
 *
 * Digambar dari berkas Figma "LOGO — PORTAL UMKM LANGENSARI". Menggantikan dua
 * elips berkait yang dipakai sebelumnya — bentuk abstrak yang tidak berarti
 * apa-apa bagi orang yang membukanya.
 *
 * SVG SEBARIS, bukan berkas gambar dan bukan huruf ikon. Alasannya bukan
 * kerapian: logo ini muncul di header SETIAP halaman, jadi sebagai berkas ia
 * berarti satu permintaan jaringan tambahan di tiap kunjungan pertama, dan
 * sebagai gambar ia tidak bisa ikut berganti warna di mode gelap.
 *
 * WARNA MANA YANG TETAP DAN MANA YANG IKUT TEMA
 *
 * Isi tasnya (`#C76F9A`, `#E8A6C4`) TETAP di kedua mode. Warna merek tidak
 * dibalik; logo yang berubah warna menurut setelan tampilan berhenti menjadi
 * tanda pengenal.
 *
 * Garis luarnya memakai `currentColor`, jadi ia mengikuti warna teks: ungu tua
 * di mode terang, krem di mode gelap. Ini persis "varian bergaris krem" yang
 * disebut catatan di berkas logonya, dan didapat tanpa menggambar logo kedua.
 */
export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="UMKM Langensari, ke beranda">
      <IkonTas className="h-8 w-8 shrink-0 text-ink" />
      <span className="flex flex-col leading-none">
        <WordmarkUmkm className="h-[15px] w-[47.7px] text-ink" />
        {/* "LANGENSARI" sengaja teks biasa, bukan path. Di berkas logonya pun ia
            teks — yang harus bebas font cuma wordmark "UMKM" itu sendiri. */}
        <span className="mt-1 font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
          Langensari
        </span>
      </span>
    </a>
  );
}

/**
 * Ikon tas, tanpa wordmark.
 *
 * Sudut pandangnya 220x220 apa adanya dari Figma supaya koordinatnya tidak perlu
 * dihitung ulang — yang mengubahnya nanti bisa mengekspor ulang lalu menempel.
 */
export function IkonTas({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" aria-hidden="true" className={className}>
      {/* Pegangan */}
      <path
        d="M77.3438 107.422V64.4531C77.3438 48.9844 88.2292 41.25 110 41.25C131.771 41.25 142.656 48.9844 142.656 64.4531V107.422"
        stroke="currentColor"
        strokeWidth="14.6094"
        strokeLinecap="round"
      />
      {/* Badan tas */}
      <path
        d="M39.5312 103.125L110 81.6406L180.469 103.125V182.188C180.469 194.219 174.453 200.234 162.422 200.234H57.5781C45.5469 200.234 39.5312 194.219 39.5312 182.188V103.125Z"
        fill="#C76F9A"
      />
      {/* Pita atap */}
      <path
        d="M39.5312 103.125L110 81.6406L180.469 103.125V122.891L110 101.406L39.5312 122.891V103.125Z"
        fill="#E8A6C4"
      />
      <path
        d="M39.5312 103.125L110 81.6406L180.469 103.125V182.188C180.469 194.219 174.453 200.234 162.422 200.234H57.5781C45.5469 200.234 39.5312 194.219 39.5312 182.188V103.125Z"
        stroke="currentColor"
        strokeWidth="12.8906"
        strokeLinejoin="round"
      />
      {/* Garis jahit. Sengaja TIDAK ikut di favicon: di bawah 32px detail ini
          hilang dan cuma membuat ikonnya terlihat kotor. */}
      <path d="M72.1875 157.266H101.406" stroke="#FFF3F8" strokeWidth="11.1719" strokeLinecap="round" />
      <path d="M118.594 157.266H147.812" stroke="#FFF3F8" strokeWidth="11.1719" strokeLinecap="round" />
    </svg>
  );
}

/** Wordmark "UMKM" sebagai path, jadi ia tidak bergantung font apa pun. */
export function WordmarkUmkm({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 460 144.571"
      fill="none"
      role="img"
      aria-label="UMKM"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="30.2286"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M27.6 23.6571V76.2286C27.6 104.267 38.1143 118.286 59.1429 118.286C80.1714 118.286 90.6857 104.267 90.6857 76.2286V23.6571" />
        <path d="M126.171 118.286V23.6571L168.229 84.1143L210.286 23.6571V118.286" />
        <path d="M245.771 23.6571V118.286" />
        <path d="M303.6 23.6571L251.029 69.6571L306.229 118.286" />
        <path d="M339.086 118.286V23.6571L381.143 84.1143L423.2 23.6571V118.286" />
      </g>
    </svg>
  );
}
