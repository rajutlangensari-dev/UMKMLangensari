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
        aksen: rgb('--aksen'),
        'aksen-kuat': rgb('--aksen-kuat'),
        'aksen-ink': rgb('--aksen-ink'),

        // Nama token dari dua generasi sebelumnya tetap dipetakan, supaya panel
        // admin dan form ikut berganti warna tanpa disentuh satu per satu.
        // brick sengaja diarahkan ke aksen: desain ini hanya punya satu warna
        // aksi, dan aksen kedua yang bersaing adalah bagian dari kebingungan
        // versi sebelumnya.
        bg: rgb('--paper'),
        deep: rgb('--aksen'),
        'deep-ink': rgb('--aksen-ink'),
        accent: rgb('--aksen'),
        'accent-strong': rgb('--aksen-kuat'),
        'accent-ink': rgb('--aksen-ink'),
        brick: rgb('--aksen'),
        'brick-strong': rgb('--aksen-kuat'),
        'brick-ink': rgb('--aksen-ink'),
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
