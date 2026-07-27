import type { Config } from 'tailwindcss';

// Warna dibaca dari CSS variable (globals.css) sebagai triplet RGB, supaya utility
// opacity (text-ink/60) jalan dan mode gelap cukup menukar nilai variabel.
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: rgb('--paper'),
        surface: rgb('--surface'),
        olive: rgb('--olive'),
        'olive-ink': rgb('--olive-ink'),
        ink: rgb('--ink'),
        brick: rgb('--brick'),
        'brick-strong': rgb('--brick-strong'),
        'brick-ink': rgb('--brick-ink'),

        // Nama token generasi sebelumnya tetap dipetakan ke token baru supaya
        // panel admin dan form ikut berubah warna tanpa harus disentuh satu-satu.
        bg: rgb('--paper'),
        deep: rgb('--olive'),
        'deep-ink': rgb('--olive-ink'),
        accent: rgb('--brick'),
        'accent-strong': rgb('--brick-strong'),
        'accent-ink': rgb('--brick-ink'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Black', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        // Label huruf besar bertracking lebar: bahasa Brooklyn Tweed untuk nav,
        // tombol, dan kategori.
        label: '0.16em',
      },
    },
  },
  plugins: [],
};

export default config;
