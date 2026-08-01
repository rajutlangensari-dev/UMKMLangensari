import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';

// Satu keluarga huruf saja, hierarki dibawa oleh ketebalan dan ukuran.
// Bricolage Grotesque dibuang: lebar dan sudutnya yang tidak rata memberi
// karakter, tapi karakter itulah yang membuat halaman terasa ramai. Satu
// keluarga juga berarti satu berkas huruf yang diunduh, lebih ringan di HP
// dengan kuota terbatas.
//
// Dua variabel dipertahankan supaya kelas `font-display` yang sudah tersebar
// di seluruh komponen tetap jalan tanpa perlu diganti satu per satu.
const fontUtama = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const JUDUL = 'UMKM Langensari | Katalog usaha warga Desa Langensari';
const DESKRIPSI =
  'Katalog bersama pelaku usaha Desa Langensari. Lihat produk dan harganya, lalu pesan langsung ke pembuatnya lewat WhatsApp.';

// Sebagian besar tautan katalog ini disebarkan lewat WhatsApp: perajin
// membagikan produknya ke pembeli, panitia membagikan katalog ke grup desa.
// Tanpa openGraph, tautan itu muncul sebagai teks polos tanpa gambar dan mudah
// dikira spam. metadataBase diperlukan supaya jalur gambar relatif
// (opengraph-image.png) berubah jadi URL penuh yang bisa diambil WhatsApp.
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://umkmlangensari.vercel.app'
  ),
  title: { default: JUDUL, template: '%s | UMKM Langensari' },
  description: DESKRIPSI,
  openGraph: {
    title: JUDUL,
    description: DESKRIPSI,
    siteName: 'UMKM Langensari',
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
      className={fontUtama.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
