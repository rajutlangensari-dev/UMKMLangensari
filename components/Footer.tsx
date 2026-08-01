import Logo, { IkonTas } from './Logo';

const NAV = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/umkm', label: 'Usaha warga' },
  { href: '/panduan', label: 'Panduan usaha' },
  { href: '/tentang', label: 'Tentang' },
];

const INFO = [
  'Kampung Cibayawak dan Kampung Cipaku',
  'Desa Langensari, Kecamatan Sukaraja',
  'Tanya stok dan pesan lewat WhatsApp',
];

/**
 * Tiga lambang penyelenggara, urut dari yang paling luas cakupannya:
 * universitas, lalu kelompok KKN-nya, lalu portal yang dibuat kelompok itu.
 *
 * Dipasang sebagai <img> biasa, bukan next/image, mengikuti seluruh gambar lain
 * di proyek ini — dan karena ukurannya sudah pasti, tidak ada yang bisa
 * dihemat lagi oleh pemroses gambar.
 *
 * `alt` ditulis lengkap: ini satu-satunya tempat di situs yang menyebut siapa
 * yang membuat portal ini, jadi pembaca layar tidak boleh cuma mendengar "logo".
 */
function Lambang() {
  return (
    <div className="flex items-center gap-3">
      <span className="plat-lambang">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-unpad.svg"
          alt="Lambang Universitas Padjadjaran"
          width={36}
          height={36}
          className="h-9 w-9"
        />
      </span>
      <span className="plat-lambang">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-kkn.png"
          alt="Logo KKN 45 Desa Langensari"
          width={36}
          height={36}
          className="h-9 w-9"
        />
      </span>
      <span aria-hidden="true" className="h-6 w-px bg-line" />
      <IkonTas className="h-9 w-9 shrink-0 text-ink" />
    </div>
  );
}

// Footer terang di atas panel lembut, bukan blok aksen pekat. Halaman ini
// selesai dengan tenang, tidak dengan pita warna penuh.
export default function Footer() {
  return (
    <footer id="kontak" className="mt-8 scroll-mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-muted">
            Temukan produk buatan warga Langensari, lihat harganya, lalu hubungi
            pembuatnya langsung lewat WhatsApp.
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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-6 sm:px-8 md:flex-row md:justify-between">
          <Lambang />
          <p className="text-center font-body text-xs leading-relaxed text-muted md:text-right">
            2026 UMKM Langensari. Dibuat oleh KKN 45 Universitas Padjadjaran
            bersama Pemerintah Desa Langensari dan pelaku usaha setempat.
          </p>
        </div>
      </div>
    </footer>
  );
}
