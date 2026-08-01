/**
 * Daftar UMKM dan produk PALSU untuk menguji portal.
 *
 * SEMUA NAMA DI SINI FIKTIF. Tidak satu pun diambil dari
 * `Data Ril/UMKM_Belum_Legalitas_Prioritas_Digital.md`.
 *
 * Alasannya: berkas itu berisi nama asli warga beserta alamat rumahnya, dan
 * ke-20 UMKM di sana belum pernah dihubungi (lihat team.md §3, "Nol nomor HP di
 * data"). Menaruh nama dan alamat asli mereka di situs publik sebagai data uji
 * berarti menerbitkan identitas orang yang belum pernah menyetujuinya. Yang
 * ditiru dari data asli hanya BENTUKNYA — jenis usaha, sebaran kluster, kisaran
 * harga — supaya pengujian tetap mendekati keadaan sebenarnya.
 *
 * Nomor WhatsApp memakai awalan 0800 yang bukan awalan seluler Indonesia mana
 * pun, jadi tombol "Pesan" tidak akan pernah sampai ke orang sungguhan.
 *
 * Nama kampung dipertahankan asli karena itu nama tempat, bukan identitas orang.
 */

export interface UmkmDummy {
  nama: string;
  slug: string;
  bio: string;
  kontakWa: string;
  alamat: string;
  produk: { nama: string; kategori: string; harga: number; deskripsi: string; stok?: string }[];
}

const wa = (n: number) => `0800${String(n).padStart(7, '0')}`;

export const UMKM_DUMMY: UmkmDummy[] = [
  {
    nama: 'Konveksi Bojong Jaya',
    slug: 'konveksi-bojong-jaya',
    bio: 'Menerima jahit kaos, kemeja seragam, dan celana. Mengerjakan pesanan satuan maupun partai.',
    kontakWa: wa(1001),
    alamat: 'Kp. Bojong RT 003 RW 002',
    produk: [
      { nama: 'Kaos Polos Katun Combed', kategori: 'Konveksi', harga: 55000, deskripsi: 'Kaos katun combed 30s, tersedia ukuran S sampai XXL.' },
      { nama: 'Kemeja Seragam Lengan Pendek', kategori: 'Konveksi', harga: 125000, deskripsi: 'Kemeja seragam bahan drill, bisa dibordir nama.' },
      { nama: 'Celana Training Dewasa', kategori: 'Konveksi', harga: 85000, deskripsi: 'Celana training bahan diadora, karet pinggang.' },
    ],
  },
  {
    nama: 'Sablon Cikajona',
    slug: 'sablon-cikajona',
    bio: 'Sablon manual dan digital untuk kaos komunitas, seragam sekolah, dan suvenir acara.',
    kontakWa: wa(1002),
    alamat: 'Kp. Cikajona RT 003 RW 002',
    produk: [
      { nama: 'Kaos Sablon Satuan', kategori: 'Konveksi', harga: 75000, deskripsi: 'Kaos plus sablon satu sisi, desain dari pembeli.' },
      { nama: 'Totebag Sablon', kategori: 'Konveksi', harga: 35000, deskripsi: 'Totebag kanvas dengan sablon satu warna.' },
    ],
  },
  {
    nama: 'Jahit Rapi Kopeng',
    slug: 'jahit-rapi-kopeng',
    bio: 'Jahit dan permak pakaian. Melayani jahit baju baru dengan bahan dari pembeli.',
    kontakWa: wa(1003),
    alamat: 'Kp. Kopeng RT 001 RW 005',
    produk: [
      { nama: 'Jasa Permak Celana', kategori: 'Konveksi', harga: 20000, deskripsi: 'Potong panjang, kecilkan pinggang, ganti resleting.' },
      { nama: 'Gamis Jahit Ukuran', kategori: 'Konveksi', harga: 180000, deskripsi: 'Gamis dijahit sesuai ukuran, bahan dari pembeli.' },
    ],
  },
  {
    nama: 'Buket Pasirhalang',
    slug: 'buket-pasirhalang',
    bio: 'Rangkaian bunga segar dari kebun sendiri. Buket wisuda, ulang tahun, dan pernikahan.',
    kontakWa: wa(1004),
    alamat: 'Kp. Pasirhalang RT 004 RW 008',
    produk: [
      { nama: 'Buket Wisuda Bunga Segar', kategori: 'Buket', harga: 95000, deskripsi: 'Buket bunga segar dibungkus kertas Korea. Pesan sehari sebelumnya.' },
      { nama: 'Buket Mawar Mini', kategori: 'Buket', harga: 65000, deskripsi: 'Sembilan tangkai mawar dengan baby breath.' },
      { nama: 'Standing Flower Ucapan', kategori: 'Buket', harga: 350000, deskripsi: 'Papan bunga berdiri untuk pernikahan atau pembukaan usaha.', stok: 'Habis' },
    ],
  },
  {
    nama: 'Rangkai Melati Asri',
    slug: 'rangkai-melati-asri',
    bio: 'Melayani rangkaian melati untuk pengantin dan keperluan adat.',
    kontakWa: wa(1005),
    alamat: 'Kp. Pasirhalang RT 003 RW 008',
    produk: [
      { nama: 'Roncean Melati Pengantin', kategori: 'Buket', harga: 150000, deskripsi: 'Roncean melati segar, dikerjakan pada hari acara.' },
      { nama: 'Buket Tangan Melati', kategori: 'Buket', harga: 80000, deskripsi: 'Buket melati untuk pengantin perempuan.' },
    ],
  },
  {
    nama: 'Kebun Bunga Hasanah',
    slug: 'kebun-bunga-hasanah',
    bio: 'Bunga potong langsung dari kebun. Melayani pembelian per ikat untuk perangkai lain.',
    kontakWa: wa(1006),
    alamat: 'Kp. Pasir Halang RT 004 RW 008',
    produk: [
      { nama: 'Krisan Potong per Ikat', kategori: 'Buket', harga: 25000, deskripsi: 'Satu ikat berisi sepuluh tangkai krisan.' },
      { nama: 'Mawar Potong per Ikat', kategori: 'Buket', harga: 40000, deskripsi: 'Satu ikat berisi sepuluh tangkai mawar merah.' },
    ],
  },
  {
    nama: 'Keripik Singkong Renyah',
    slug: 'keripik-singkong-renyah',
    bio: 'Keripik singkong digoreng harian, dikemas untuk dikirim ke luar desa.',
    kontakWa: wa(1007),
    alamat: 'Kp. Cibayawak RT 002 RW 013',
    produk: [
      { nama: 'Keripik Singkong Original 250g', kategori: 'Olahan Kering', harga: 18000, deskripsi: 'Keripik singkong tipis, asin gurih. Kemasan tahan tiga bulan.' },
      { nama: 'Keripik Singkong Balado 250g', kategori: 'Olahan Kering', harga: 20000, deskripsi: 'Keripik singkong bumbu balado, pedas sedang.' },
      { nama: 'Keripik Singkong Jumbo 1kg', kategori: 'Olahan Kering', harga: 65000, deskripsi: 'Kemasan besar untuk dijual kembali.' },
    ],
  },
  {
    nama: 'Sale Pisang Cibayawak',
    slug: 'sale-pisang-cibayawak',
    bio: 'Sale pisang dijemur alami tanpa pengawet. Dikemas per bungkus.',
    kontakWa: wa(1008),
    alamat: 'Kp. Cibayawak RT 001 RW 013',
    produk: [
      { nama: 'Sale Pisang Goreng 200g', kategori: 'Olahan Kering', harga: 22000, deskripsi: 'Sale pisang dibalut tepung lalu digoreng renyah.' },
      { nama: 'Sale Pisang Basah 500g', kategori: 'Olahan Kering', harga: 30000, deskripsi: 'Sale pisang jemur tanpa digoreng, manis alami.' },
    ],
  },
  {
    nama: 'Kue Kering Amanah',
    slug: 'kue-kering-amanah',
    bio: 'Kue kering rumahan untuk hari raya dan oleh-oleh. Menerima pesanan toples.',
    kontakWa: wa(1009),
    alamat: 'Kp. Cipaku RT 002 RW 013',
    produk: [
      { nama: 'Nastar Toples 500g', kategori: 'Olahan Kering', harga: 75000, deskripsi: 'Nastar isi selai nanas buatan sendiri.' },
      { nama: 'Kastengel Toples 500g', kategori: 'Olahan Kering', harga: 90000, deskripsi: 'Kastengel keju, renyah dan gurih.' },
      { nama: 'Putri Salju Toples 500g', kategori: 'Olahan Kering', harga: 70000, deskripsi: 'Putri salju lumer dengan taburan gula halus.' },
    ],
  },
  {
    nama: 'Rengginang Barokah',
    slug: 'rengginang-barokah',
    bio: 'Rengginang beras ketan, dijemur dan digoreng sendiri.',
    kontakWa: wa(1010),
    alamat: 'Kp. Bojong RT 002 RW 002',
    produk: [
      { nama: 'Rengginang Matang 250g', kategori: 'Olahan Kering', harga: 25000, deskripsi: 'Rengginang siap makan, gurih asin.' },
      { nama: 'Rengginang Mentah 500g', kategori: 'Olahan Kering', harga: 28000, deskripsi: 'Rengginang belum digoreng, tahan lama.' },
    ],
  },
  {
    nama: 'Kopi Bubuk Langensari',
    slug: 'kopi-bubuk-langensari',
    bio: 'Kopi robusta dari kebun sekitar, disangrai dan digiling di rumah.',
    kontakWa: wa(1011),
    alamat: 'Kp. Pasirhalang RT 002 RW 008',
    produk: [
      { nama: 'Kopi Bubuk Robusta 200g', kategori: 'Olahan Kering', harga: 35000, deskripsi: 'Robusta sangrai medium, digiling halus.' },
      { nama: 'Kopi Biji Sangrai 500g', kategori: 'Olahan Kering', harga: 80000, deskripsi: 'Biji kopi utuh untuk digiling sendiri.' },
    ],
  },
  {
    nama: 'Bawang Goreng Sedap',
    slug: 'bawang-goreng-sedap',
    bio: 'Bawang goreng renyah tanpa tepung, digoreng setiap pesanan masuk.',
    kontakWa: wa(1012),
    alamat: 'Kp. Cikajona RT 002 RW 002',
    produk: [
      { nama: 'Bawang Goreng 100g', kategori: 'Olahan Kering', harga: 28000, deskripsi: 'Bawang merah goreng murni, tanpa campuran tepung.' },
      { nama: 'Bawang Goreng 250g', kategori: 'Olahan Kering', harga: 65000, deskripsi: 'Kemasan besar untuk warung atau katering.' },
    ],
  },
  {
    nama: 'Sambal Kemasan Pedas Manis',
    slug: 'sambal-kemasan-pedas-manis',
    bio: 'Sambal botolan dimasak sendiri, tanpa pengawet. Simpan di kulkas.',
    kontakWa: wa(1013),
    alamat: 'Kp. Kopeng RT 002 RW 005',
    produk: [
      { nama: 'Sambal Bawang Botol 200ml', kategori: 'Olahan Kering', harga: 32000, deskripsi: 'Sambal bawang pedas, tahan dua minggu di kulkas.' },
      { nama: 'Sambal Ijo Botol 200ml', kategori: 'Olahan Kering', harga: 32000, deskripsi: 'Sambal cabai hijau, pedas sedang.' },
    ],
  },
  {
    nama: 'Abon Sapi Mekar',
    slug: 'abon-sapi-mekar',
    bio: 'Abon sapi dimasak dengan bumbu rumahan, dikemas kedap udara.',
    kontakWa: wa(1014),
    alamat: 'Kp. Bojong RT 004 RW 002',
    produk: [
      { nama: 'Abon Sapi 100g', kategori: 'Olahan Kering', harga: 45000, deskripsi: 'Abon sapi manis gurih, kemasan kedap udara.' },
      { nama: 'Abon Sapi Pedas 100g', kategori: 'Olahan Kering', harga: 48000, deskripsi: 'Abon sapi dengan cabai kering.' },
    ],
  },
  {
    nama: 'Peci Rajut Sukamaju',
    slug: 'peci-rajut-sukamaju',
    bio: 'Peci rajut tangan, dikerjakan ibu-ibu di rumah masing-masing.',
    kontakWa: wa(1015),
    alamat: 'Kp. Sukamaju RT 001 RW 004',
    produk: [
      { nama: 'Peci Rajut Polos Dewasa', kategori: 'Kerajinan', harga: 45000, deskripsi: 'Peci rajut benang katun, tersedia hitam dan putih.' },
      { nama: 'Peci Rajut Motif', kategori: 'Kerajinan', harga: 55000, deskripsi: 'Peci rajut dengan motif garis dua warna.' },
      { nama: 'Peci Rajut Anak', kategori: 'Kerajinan', harga: 35000, deskripsi: 'Ukuran anak, benang lebih lembut.' },
    ],
  },
  {
    nama: 'Peci Bordir Cipaku',
    slug: 'peci-bordir-cipaku',
    bio: 'Peci bordir mesin dengan motif pesanan. Bisa dibordir nama.',
    kontakWa: wa(1016),
    alamat: 'Kp. Cipaku RT 003 RW 013',
    produk: [
      { nama: 'Peci Bordir Motif Klasik', kategori: 'Kerajinan', harga: 60000, deskripsi: 'Peci beludru dengan bordir motif klasik.' },
      { nama: 'Peci Bordir Nama', kategori: 'Kerajinan', harga: 75000, deskripsi: 'Peci dengan bordir nama, minimal pesan lima.' },
    ],
  },
  {
    nama: 'Meubel Kayu Langensari',
    slug: 'meubel-kayu-langensari',
    bio: 'Meubel kayu pesanan: lemari, meja, kursi, dan rak. Bahan kayu mahoni dan jati.',
    kontakWa: wa(1017),
    alamat: 'Kp. Bojong RT 001 RW 002',
    produk: [
      { nama: 'Rak Buku Kayu 3 Susun', kategori: 'Meubel', harga: 450000, deskripsi: 'Rak kayu mahoni, finishing plitur natural.' },
      { nama: 'Meja Belajar Anak', kategori: 'Meubel', harga: 600000, deskripsi: 'Meja belajar dengan laci, kayu mahoni.' },
      { nama: 'Kursi Teras Kayu', kategori: 'Meubel', harga: 350000, deskripsi: 'Kursi kayu untuk teras, tahan cuaca.', stok: 'Habis' },
    ],
  },
  {
    nama: 'Anyaman Bambu Cikajona',
    slug: 'anyaman-bambu-cikajona',
    bio: 'Anyaman bambu untuk keperluan rumah tangga dan hiasan.',
    kontakWa: wa(1018),
    alamat: 'Kp. Cikajona RT 001 RW 002',
    produk: [
      { nama: 'Besek Bambu Ukuran Sedang', kategori: 'Kerajinan', harga: 12000, deskripsi: 'Besek bambu untuk hantaran atau kemasan makanan.' },
      { nama: 'Tampah Bambu 40cm', kategori: 'Kerajinan', harga: 35000, deskripsi: 'Tampah anyaman rapat, bisa untuk hiasan dinding.' },
    ],
  },
  {
    nama: 'Tas Kain Perca Bojong',
    slug: 'tas-kain-perca-bojong',
    bio: 'Tas dan dompet dari kain sisa konveksi. Tiap barang motifnya berbeda.',
    kontakWa: wa(1019),
    alamat: 'Kp. Bojong RT 003 RW 002',
    produk: [
      { nama: 'Tas Jinjing Kain Perca', kategori: 'Kerajinan', harga: 55000, deskripsi: 'Tas jinjing dari kain sisa konveksi, motif acak.' },
      { nama: 'Dompet Kain Perca', kategori: 'Kerajinan', harga: 25000, deskripsi: 'Dompet kecil berisleting, motif acak.' },
    ],
  },
  {
    nama: 'Madu Hutan Langensari',
    slug: 'madu-hutan-langensari',
    bio: 'Madu dari lebah ternak sendiri. Dipanen dua kali setahun.',
    kontakWa: wa(1020),
    alamat: 'Kp. Pasirhalang RT 001 RW 008',
    produk: [
      { nama: 'Madu Hutan Botol 250ml', kategori: 'Olahan Kering', harga: 85000, deskripsi: 'Madu murni tanpa campuran gula.' },
      { nama: 'Madu Hutan Botol 500ml', kategori: 'Olahan Kering', harga: 160000, deskripsi: 'Kemasan besar, lebih hemat.' },
    ],
  },
];
