import Logo from './Logo';

// Semua link mengarah ke tujuan nyata (halaman/anchor yang benar-benar ada),
// tidak ada tautan kebijakan atau karier palsu.
const NAV = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/panduan', label: 'Panduan usaha' },
  { href: '/tentang', label: 'Tentang' },
];

const INFO = [
  'Desa Langensari, Kecamatan Sukaraja',
  'Kampung Cibayawak dan Kampung Cipaku',
  'Pemesanan melalui WhatsApp',
];

export default function Footer() {
  return (
    <footer id="kontak" className="scroll-mt-28 bg-olive text-olive-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1.7fr_1fr_1fr]">
        <div>
          <Logo terang />
          <p className="mt-5 max-w-xs font-body text-sm leading-relaxed text-olive-ink/80">
            Lihat karya perajin rumahan Desa Langensari dan hubungi pembuatnya melalui
            WhatsApp.
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <h2 className="font-body text-[0.66rem] uppercase tracking-label text-olive-ink/70">
            Halaman
          </h2>
          <ul className="mt-4 space-y-3">
            {NAV.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="font-body text-sm text-olive-ink/85 underline-offset-4 transition-colors hover:text-olive-ink hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-body text-[0.66rem] uppercase tracking-label text-olive-ink/70">
            Lokasi dan pemesanan
          </h2>
          <ul className="mt-4 space-y-3">
            {INFO.map((t) => (
              <li key={t} className="font-body text-sm text-olive-ink/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-olive-ink/20">
        <p className="mx-auto max-w-7xl px-5 py-6 text-center font-body text-[0.66rem] uppercase tracking-label text-olive-ink/70 sm:px-8">
          © 2026 Rajut Langensari · Tim KKN Universitas Padjadjaran.
        </p>
      </div>
    </footer>
  );
}
