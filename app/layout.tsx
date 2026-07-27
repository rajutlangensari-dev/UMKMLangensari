import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google';
import './globals.css';

// Pasangan dipilih pada sumbu kontras bentuk, bukan dua grotesque yang mirip:
// Bricolage punya lebar dan sudut yang tidak rata (energi papan nama pasar),
// Instrument Sans humanis dan tenang untuk teks panjang, harga, dan form admin.
const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const fontBody = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const JUDUL = 'Rajut Langensari | Katalog Produk Lokal';
const DESKRIPSI =
  'Temukan produk rajut buatan perajin Desa Langensari, lengkap dengan harga dan kontak pembuat untuk pemesanan melalui WhatsApp.';

// Sebagian besar tautan katalog ini disebarkan lewat WhatsApp: perajin
// membagikan produknya ke pembeli, panitia membagikan katalog ke grup desa.
// Tanpa openGraph, tautan itu muncul sebagai teks polos tanpa gambar dan mudah
// dikira spam. metadataBase diperlukan supaya jalur gambar relatif
// (opengraph-image.png) berubah jadi URL penuh yang bisa diambil WhatsApp.
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://umkmlangensari.vercel.app'
  ),
  title: { default: JUDUL, template: '%s | Rajut Langensari' },
  description: DESKRIPSI,
  openGraph: {
    title: JUDUL,
    description: DESKRIPSI,
    siteName: 'Rajut Langensari',
    locale: 'id_ID',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const themeInit = `(function(){try{var t=localStorage.getItem('tema');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${fontDisplay.variable} ${fontBody.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
