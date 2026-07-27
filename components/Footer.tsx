import Logo from './Logo';

const NAV = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/panduan', label: 'Panduan usaha' },
  { href: '/tentang', label: 'Tentang' },
];

const INFO = [
  'Kampung Cibayawak dan Kampung Cipaku',
  'Desa Langensari, Kecamatan Sukaraja',
  'Pesan langsung lewat WhatsApp',
];

// Footer terang di atas panel lembut, bukan blok olive pekat. Halaman ini
// selesai dengan tenang, tidak dengan pita warna penuh.
export default function Footer() {
  return (
    <footer id="kontak" className="mt-8 scroll-mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-muted">
            Produk dalam katalog ini berasal dari perajin Kampung Cibayawak dan Cipaku,
            Desa Langensari. Anda dapat memesan langsung lewat WhatsApp.
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <h2 className="font-display text-sm font-semibold text-ink">Halaman</h2>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="font-body text-sm text-muted transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold text-ink">Lokasi dan pemesanan</h2>
          <ul className="mt-4 space-y-2.5">
            {INFO.map((t) => (
              <li key={t} className="font-body text-sm text-muted">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-5 text-center font-body text-xs text-muted sm:px-8">
          2026 Rajut Langensari. Tim KKN Universitas Padjadjaran.
        </p>
      </div>
    </footer>
  );
}
