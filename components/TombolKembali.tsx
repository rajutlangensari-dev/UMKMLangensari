'use client';

import { useRouter } from 'next/navigation';

/** Kembali mengikuti riwayat peramban, dengan tujuan aman untuk kunjungan langsung. */
export default function TombolKembali({
  fallbackHref,
  label = 'Kembali',
  className = '',
}: {
  fallbackHref: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function kembali() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={kembali}
      className={`tekan inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-5 font-body text-base text-muted transition-[transform,color,border-color,background-color] duration-150 ease-out hover:border-aksen hover:bg-surface hover:text-ink sm:min-h-11 sm:px-4 sm:text-sm ${className}`}
    >
      <span aria-hidden="true">&larr;</span>
      {label}
    </button>
  );
}
