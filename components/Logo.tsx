// Mark: dua simpul rantai saling-kait, motif tusuk rantai dasar rajutan.
// Wordmark diturunkan dari huruf besar tebal ke huruf biasa berbobot sedang,
// mengikuti arah minimalis: tanda merek tidak perlu berteriak di tiap halaman.
export default function Logo({ terang = false }: { terang?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 30 18" className="h-4 w-7 shrink-0" fill="none" aria-hidden="true">
        <ellipse cx="10" cy="9" rx="8" ry="6.6" className="stroke-olive" strokeWidth="2.4" />
        <ellipse cx="20" cy="9" rx="8" ry="6.6" className="stroke-olive" strokeWidth="2.4" />
      </svg>
      <span
        className={`font-display text-base font-semibold tracking-[-0.01em] ${
          terang ? 'text-olive-ink' : 'text-ink'
        }`}
      >
        Rajut Langensari
      </span>
    </a>
  );
}
