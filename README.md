# Portal UMKM Langensari

Next.js App Router, TypeScript, dan Tailwind. Route utama:

- `/` - beranda portal
- `/umkm` dan `/umkm/[slug]` - daftar dan halaman tiap pelaku usaha
- `/katalog` - katalog publik, filter kategori, dan pencarian
- `/produk/[id]` - detail produk yang bisa dibagikan
- `/tentang` - profil usaha
- `/admin` - tambah, ubah, dan hapus produk

Semua data produk datang dari Google Sheet lewat backend Apps Script. Produk
tidak ditulis di kode frontend.

## Menjalankan di lokal

Backend Apps Script harus sudah aktif.

```
npm install
cp .env.example .env.local
# isi NEXT_PUBLIC_APPS_SCRIPT_URL di .env.local dengan URL exec dari backend
npm run dev
```

Buka `http://localhost:3000`.

## Pemeriksaan lokal

```
npm run lint
npm run build
```

Tidak ada deploy yang dijalankan dalam sesi enhancement 2026-07-27. Sebelum
deploy, bersihkan data uji di Google Sheet dan selesaikan upgrade keamanan
Next.js yang dicatat di `DESIGN.md`.

## Struktur

```
app/
  page.tsx              beranda
  katalog/page.tsx      katalog publik
  tentang/page.tsx      profil usaha
  produk/[id]/page.tsx  detail produk
  admin/page.tsx        panel admin
components/
  Hero.tsx
  Pita.tsx
  RailKategori.tsx
  Cerita.tsx
  GridProduk.tsx        filter kategori + pencarian
  KartuProduk.tsx
  FormProduk.tsx        form tambah/ubah
  Footer.tsx
lib/
  types.ts              tipe data
  api.ts                panggilan ke backend Apps Script
```
