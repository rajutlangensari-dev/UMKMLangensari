# Arah desain: Rajut Langensari (Katalog-Dev)

## Design read

Katalog produk rajut buatan tangan Desa Langensari untuk pembeli lokal dan luar
desa, dibuka mayoritas dari HP Android murah. Tugas halaman: bikin orang paham
barangnya apa, harganya berapa, siapa yang bikin, lalu buka WhatsApp.

Bahasa visual: **retro-editorial hangat**, gabungan dua referensi yang diberikan
PIC.

- **Brooklyn Tweed** menyumbang disiplinnya: mosaik foto asimetris, label huruf
  besar bertracking lebar, tombol berbentuk kotak/pil beroutline, blok gelap
  penutup halaman, ruang kosong yang berani.
- **Retro Bloom** menyumbang kehangatannya: blok olive besar, pita berjalan,
  pembatas bergelombang, bingkai produk seperti stiker, tipografi display gemuk.

Titik temunya: keduanya jualan tekstil. Dari situ fusinya masuk akal, bukan
tempelan.

## Dials

- Design variance: 7
- Motion intensity: 4
- Visual density: 4

## Token warna

Strategi: **committed**. Olive membawa 35-40% permukaan sebagai blok penuh
(pita header, hero, keunggulan, footer), bukan cuma aksen. Kertas oat sengaja
dicondongkan ke hijau (hue benang), bukan ke oranye hangat, supaya tidak jatuh
ke krem template.

| Token | Terang | Gelap | Peran |
|---|---|---|---|
| `--paper` | `#EFEDE1` | `#1A1C14` | Latar halaman |
| `--surface` | `#E2DFCE` | `#262A1B` | Sumur foto, input, blok pembuat |
| `--olive` | `#656B37` | `#8A9150` | Blok merek, pita, footer |
| `--olive-ink` | `#F2F0E2` | `#16180F` | Teks di atas olive |
| `--ink` | `#262418` | `#E9E7D8` | Teks utama |
| `--brick` | `#B4472C` | `#D4674A` | Satu-satunya aksen, semua aksi |
| `--brick-strong` | `#97381F` | `#E07B5E` | Hover aksi |

Kontras sudah diperiksa manual, semua teks isi lolos WCAG AA (>= 4.5:1):
brick di atas paper 4.64:1, olive-ink di atas olive 4.87:1, ink di atas paper
13.3:1. Batas bawah teks redup adalah `text-ink/65`; apa pun di bawah itu jatuh
di bawah AA dan tidak dipakai.

Nama token lama (`bg`, `deep`, `accent`, ...) tetap dipetakan di
`tailwind.config.ts` supaya panel admin dan form ikut berganti warna tanpa
disentuh satu per satu.

## Tipografi

- **Display: Bricolage Grotesque** (700/800). Lebar dan sudutnya tidak rata,
  energinya papan nama pasar. Dipakai untuk judul, harga, dan wordmark.
- **Body: Instrument Sans**. Humanis dan tenang untuk teks panjang, keterangan
  perajut, dan form admin.

Dipasangkan pada sumbu kontras bentuk (grotesque berkarakter vs humanis netral),
bukan dua sans yang mirip. Serif editorial generasi sebelumnya (Cormorant)
dibuang: itu default "craft = serif" yang bikin semua situs kerajinan seragam.

Label huruf besar memakai `tracking-label` (0.16em) untuk nav, tombol, kategori,
dan keterangan kecil. Itu suara Brooklyn Tweed di dalam sistem ini.

## Bentuk

Satu aturan, dipakai di mana-mana:

- Wadah dan foto: `rounded-[14px]`
- Elemen interaktif (tombol, pil, input): `rounded-full`

## Tanda tangan

**Label tenun** (`.label-tenun` di `globals.css`). Foto produk duduk di sumur
oat, dikelilingi stroke kertas tebal lalu garis rambut brick yang meleset
sedikit ke kanan-atas, meniru label kain yang dijahit ke karton. Hanya dipakai
di foto produk (hero, kartu katalog, detail, mosaik cerita) supaya tetap jadi
satu hal yang diingat, bukan ornamen yang diulang ke semua section.

Pendukungnya dua, masing-masing sekali pakai per halaman:

- **Pembatas bergelombang** (`.gelombang`), penutup blok olive.
- **Pita berjalan** (`Pita.tsx`), membawa produk asli yang sedang ada, masing
  masing tertaut ke halamannya. Berhenti saat disorot atau difokus keyboard.
  Bukan strip dekorasi.

## Peta layout

```text
BERANDA
+---------------------------------------------+
| pita keterangan asal barang (olive)         |
| header: logo | nav huruf besar | tema       |
+----------------------+----------------------+
| judul + CTA (olive)  | foto label tenun     |
+----------------------+----------------------+
| ~~~~~~~ gelombang ~~~~~~~~~~~~~~~~~~~~~~~~~ |
| pita produk berjalan (olive)                |
+---------------------------------------------+
| rel kategori: intro kiri, foto asli kanan   |
+---------------------------------------------+
| MOSAIK: foto 4:5 | cerita | foto 1:1        |
+---------------------------------------------+
| tiga keterangan dipisah garis rambut (olive)|
+---------------------------------------------+
| footer olive: merek | halaman | keterangan  |
+---------------------------------------------+
```

```text
KATALOG
+---------------------------------------------+
| judul poster            | jumlah produk     |
+---------------------------------------------+
| pil kategori (gulir mendatar) + pencarian   |  <- lengket
+---------------------------------------------+
| grid label tenun, 2 kolom / 3 kolom         |
+---------------------------------------------+
```

Tiap section memakai keluarga layout yang berbeda: belah dua, pita, rel gulir,
mosaik asimetris, pita berpetak. Tidak ada dua section yang bentuknya sama, dan
tidak ada zigzag foto-teks berulang.

## Audit dan keputusan

Yang dibuang dari versi sebelumnya:

- Serif editorial (Cormorant) sebagai display. Default "craft = serif".
- Aksen mawar/plum. Diganti brick, satu aksen untuk seluruh halaman.
- Hero foto penuh dengan overlay gradien dan teks di atasnya. Diganti hero
  terbelah supaya headline tidak pernah bertarung dengan foto.
- Tiga kartu keunggulan sama besar. Diganti pita olive berpetak garis rambut,
  tanpa kotak.
- Teks redup di bawah AA (`text-ink/45`, `text-ink/55` untuk teks isi).

Yang dipertahankan: seluruh route, `lib/api.ts`, `lib/types.ts`, alur pesan
WhatsApp, panel admin, dan mekanisme tema terang/gelap. Perombakan ini murni
token, tipografi, komposisi, bentuk, dan state.

Design DNA lengkap yang menurunkan dua referensi ke token, gaya, dan efek ada
di `design-dna.json`.

## Hasil uji lokal 2026-07-27

- `npm run lint` lulus tanpa warning atau error.
- `npm run build` lulus untuk 7 route.
- Beranda dan katalog diperiksa pada viewport 390 x 844 dan 1440 x 1100.
- Mode terang dan gelap diperiksa. Tidak ada overflow horizontal.
- Header mobile, filter kategori, pencarian, skeleton, empty state, dan CTA
  WhatsApp tetap terbaca pada lebar mobile.
- Teks admin yang masih memakai opacity `/45` dan `/55` dinaikkan ke batas
  proyek `/65`.

## Yang belum dikerjakan

- Rel kategori dan pita berjalan bergantung pada data produk nyata. Dengan satu
  atau dua produk saja, keduanya tidak dirender (ambang: kategori >= 2,
  produk >= 4). Perlu dicek lagi setelah 20 UMKM masuk.
- Data aktif masih memuat foto uji yang tidak sesuai produk, foto kosong,
  kontak WhatsApp kosong, dan entri bernama `Cek`. Bersihkan Google Sheet
  sebelum deploy karena frontend sengaja menampilkan data sumber apa adanya.
- `npm audit --omit=dev` menemukan dua kerentanan runtime tingkat tinggi pada
  Next.js 14. Perbaikannya meminta upgrade mayor ke Next.js 16. Migrasi itu
  perlu dikerjakan dan diuji terpisah sebelum deploy.
- Route `/handbook` untuk keychain QR workshop belum dibuat.
