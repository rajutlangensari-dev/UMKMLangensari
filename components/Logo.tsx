// Mark: tiga simpul rantai saling-kait, motif tusuk rantai yang jadi dasar semua
// rajutan. Geometris murni (tiga elips beroutline), jadi tetap terbaca di 24px
// dan tidak jatuh ke ilustrasi. `terang` untuk latar olive (header pita, footer).
export default function Logo({ terang = false }: { terang?: boolean }) {
  const garis = terang ? 'stroke-olive-ink' : 'stroke-brick';
  const teks = terang ? 'text-olive-ink' : 'text-ink';

  return (
    <a href="/" className="group flex items-center gap-2.5">
      <svg viewBox="0 0 44 20" className="h-5 w-11 shrink-0" fill="none" aria-hidden="true">
        <ellipse cx="11" cy="10" rx="9" ry="7.5" className={garis} strokeWidth="2.6" />
        <ellipse cx="22" cy="10" rx="9" ry="7.5" className={garis} strokeWidth="2.6" />
        <ellipse cx="33" cy="10" rx="9" ry="7.5" className={garis} strokeWidth="2.6" />
      </svg>
      <span
        className={`font-display text-[1.05rem] font-extrabold uppercase leading-none tracking-[-0.01em] ${teks}`}
      >
        Rajut Langensari
      </span>
    </a>
  );
}
