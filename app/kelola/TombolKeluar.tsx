'use client';

export default function TombolKeluar() {
  async function keluar() {
    await fetch('/api/keluar', { method: 'POST' });
    // Muat ulang penuh, bukan router.push: cookie dihapus di sisi respons, dan
    // cache router masih memegang halaman versi "sudah masuk".
    window.location.href = '/';
  }

  return (
    <button
      type="button"
      onClick={keluar}
      className="tekan shrink-0 rounded-full border border-line px-5 py-2.5 font-body text-sm text-muted transition-[transform,color,border-color] duration-150 ease-out hover:border-aksen hover:text-ink"
    >
      Keluar
    </button>
  );
}
