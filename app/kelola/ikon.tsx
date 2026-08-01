/**
 * Ikon sidebar.
 *
 * Ditulis tangan sebagai SVG, bukan diambil dari pustaka ikon. Satu paket ikon
 * membawa ratusan berkas untuk enam yang dipakai, dan proyek ini diserahkan ke
 * desa — tiap dependensi adalah pekerjaan pembaruan untuk orang yang tidak akan
 * memperbaruinya.
 *
 * Semuanya bergaris (bukan padat) dan memakai `currentColor`, jadi keduanya
 * ikut warna butir aktif tanpa varian kedua.
 */

const dasar = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'h-[18px] w-[18px]',
  'aria-hidden': true,
};

export const IkonBeranda = () => (
  <svg {...dasar}>
    <path d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const IkonProduk = () => (
  <svg {...dasar}>
    <path d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5z" />
    <path d="M3 6.5 10 10l7-3.5M10 10v7" />
  </svg>
);

export const IkonUmkm = () => (
  <svg {...dasar}>
    <path d="M3 8h14v9H3z" />
    <path d="M3 8l1.5-4h11L17 8M7.5 17v-4h5v4" />
  </svg>
);

export const IkonHalaman = () => (
  <svg {...dasar}>
    <path d="M3 3h14v14H3z" />
    <path d="M3 7.5h14M7.5 7.5V17" />
  </svg>
);

export const IkonProfil = () => (
  <svg {...dasar}>
    <circle cx="10" cy="7" r="3.2" />
    <path d="M3.8 17c.6-3.2 3.1-5 6.2-5s5.6 1.8 6.2 5" />
  </svg>
);

export const IkonAkun = () => (
  <svg {...dasar}>
    <circle cx="7.5" cy="7" r="2.8" />
    <path d="M2.5 16.5c.5-2.8 2.6-4.4 5-4.4s4.5 1.6 5 4.4" />
    <path d="M13.5 5.5h4M15.5 3.5v4" />
  </svg>
);

export const IkonSandi = () => (
  <svg {...dasar}>
    <path d="M5 9h10v8H5z" />
    <path d="M7.5 9V6.5a2.5 2.5 0 0 1 5 0V9" />
  </svg>
);
