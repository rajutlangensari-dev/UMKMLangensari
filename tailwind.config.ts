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
        line: rgb('--line'),
        ink: rgb('--ink'),
        muted: rgb('--muted'),
        olive: rgb('--olive'),
        'olive-strong': rgb('--olive-strong'),
        'olive-ink': rgb('--olive-ink'),

        // Nama token dari dua generasi sebelumnya tetap dipetakan, supaya panel
        // admin dan form ikut berganti warna tanpa disentuh satu per satu.
        // brick sengaja diarahkan ke olive: desain ini hanya punya satu warna
        // aksi, dan aksen kedua yang bersaing adalah bagian dari kebingungan
        // versi sebelumnya.
        bg: rgb('--paper'),
        deep: rgb('--olive'),
        'deep-ink': rgb('--olive-ink'),
        accent: rgb('--olive'),
        'accent-strong': rgb('--olive-strong'),
        'accent-ink': rgb('--olive-ink'),
        brick: rgb('--olive'),
        'brick-strong': rgb('--olive-strong'),
        'brick-ink': rgb('--olive-ink'),
      },
      fontFamily: {
        // Keduanya menunjuk keluarga yang sama; hierarki dibawa ketebalan.
        display: ['var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.12em',
      },
      borderRadius: {
        kartu: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
