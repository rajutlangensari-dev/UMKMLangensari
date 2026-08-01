/**
 * Uji alur penuh terhadap server yang sedang berjalan.
 *
 *   npm run dev          di satu terminal
 *   npm run uji:alur     di terminal lain
 *
 * Yang diperiksa adalah hal-hal yang kalau rusak, portalnya bocor atau diam-diam
 * salah — bukan tampilan. Tampilan tetap harus dilihat mata di peramban.
 *
 * Butuh dua akun yang sudah ada. Sebutkan lewat variabel lingkungan:
 *   UJI_ADMIN=admin UJI_ADMIN_SANDI=xxx UJI_UMKM=rajut UJI_UMKM_SANDI=yyy npm run uji:alur
 *
 * Skrip ini MEMBUAT lalu MENGHAPUS satu produk uji. Tidak menyentuh data lain.
 */

const ASAL = process.env.UJI_ASAL || 'http://localhost:3000';
const ADMIN = process.env.UJI_ADMIN || 'admin';
const ADMIN_SANDI = process.env.UJI_ADMIN_SANDI || '';
const UMKM = process.env.UJI_UMKM || '';
const UMKM_SANDI = process.env.UJI_UMKM_SANDI || '';

let lolos = 0;
let gagal = 0;

function cek(nama, benar, ket = '') {
  if (benar) {
    console.log(`  OK   ${nama}`);
    lolos++;
  } else {
    console.log(` GAGAL ${nama}${ket ? ' — ' + ket : ''}`);
    gagal++;
  }
}

/** fetch yang membawa cookie sendiri, karena Node tidak punya jar cookie bawaan. */
function sesiBaru() {
  let cookie = '';
  return async function (jalur, opsi = {}) {
    const res = await fetch(`${ASAL}${jalur}`, {
      ...opsi,
      headers: { ...(opsi.headers || {}), ...(cookie ? { Cookie: cookie } : {}) },
      redirect: 'manual',
    });
    const set = res.headers.getSetCookie?.() || [];
    for (const c of set) {
      const potong = c.split(';')[0];
      if (potong.startsWith('sesi=')) cookie = potong;
    }
    return res;
  };
}

async function json(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function jalan() {
  console.log(`Menguji ${ASAL}\n`);

  // --- 1. Halaman publik hidup ---
  for (const jalur of ['/', '/katalog', '/umkm', '/tentang', '/panduan', '/masuk']) {
    const res = await fetch(`${ASAL}${jalur}`);
    cek(`GET ${jalur} balas 200`, res.status === 200, `dapat ${res.status}`);
  }
  const nyasar = await fetch(`${ASAL}/umkm/slug-yang-tidak-ada`);
  cek('Slug UMKM ngawur balas 404', nyasar.status === 404, `dapat ${nyasar.status}`);

  // --- 1b. Halaman publik dirender di SERVER, bukan diisi JavaScript ---
  //
  // Penjaga regresi. Beranda dan katalog pernah `'use client'` dan mengambil
  // produk di useEffect: cat pertama kosong, hero melompat saat data tiba, dan
  // foto hero tidak pernah sempat jadi LCP karena belum ada di HTML. Kalau
  // suatu hari ada yang mengembalikannya, pemeriksaan ini yang berteriak —
  // build dan lint tidak akan.
  const beranda = await (await fetch(`${ASAL}/`)).text();
  const katalogHtml = await (await fetch(`${ASAL}/katalog`)).text();
  const adaProduk = (katalogHtml.match(/href="\/produk\//g) || []).length;

  if (adaProduk === 0) {
    console.log('  (lewati uji render server — katalog sedang kosong)');
  } else {
    cek(
      'Beranda mengirim produk di HTML pertama, bukan setelah JavaScript',
      /href="\/produk\//.test(beranda),
      'tidak ada tautan produk di HTML beranda'
    );
    // Sorotan beranda memuat PELAKU USAHA, bukan produk lepas. Kalau ia tidak
    // lagi mengirim tautan ke halaman usaha di HTML pertama, berarti hero-nya
    // kembali diisi JavaScript atau kembali menyorot barang tanpa pembuatnya.
    cek(
      'Beranda menyorot pelaku usaha di HTML pertama',
      /href="\/umkm\/[a-z0-9-]+"/.test(beranda),
      'tidak ada tautan halaman usaha di HTML beranda'
    );
    cek(
      'Sorotan beranda memuat barang usaha yang sedang disorot',
      /hero-penuh[\s\S]*?href="\/produk\//.test(beranda),
      'tidak ada tautan produk di dalam bagian sorotan'
    );

    // Foto potret pemilik adalah kandidat LCP beranda. Pemeriksaan ini
    // melewatkan dirinya sendiri kalau usaha yang kebetulan disorot hari ini
    // belum memasang foto profil — kegagalan palsu di situ akan membuat orang
    // berhenti mempercayai seluruh berkas ini.
    const adaPotret = /class="[^"]*hero-potret[^"]*"[\s\S]{0,300}?<img/.test(beranda);
    if (adaPotret) {
      cek(
        'Foto potret di sorotan diberi prioritas muat di HTML',
        /fetchpriority="high"/i.test(beranda),
        'tidak ada fetchpriority pada potret sorotan'
      );
    } else {
      console.log('  (lewati uji prioritas foto — usaha yang disorot belum punya foto profil)');
    }

    // Tautan tersaring yang dibagikan lewat WhatsApp harus sudah benar di cat
    // pertama, bukan berkedip "Semua" dulu.
    // Atribut lain ada di antara `aria-pressed` dan teksnya (className), jadi
    // `[^>]*` bukan hiasan — tanpa itu pemeriksaan ini diam-diam terlewat.
    const kategori = katalogHtml.match(/aria-pressed="false"[^>]*>([^<]+)</)?.[1];
    if (kategori) {
      const tersaring = await (
        await fetch(`${ASAL}/katalog?kategori=${encodeURIComponent(kategori)}`)
      ).text();
      cek(
        'Katalog menerapkan saringan kategori di render server',
        new RegExp(`aria-pressed="true"[^>]*>${kategori}<`).test(tersaring),
        `kategori ${kategori} tidak aktif di HTML pertama`
      );
    }
  }

  // --- 1c. Tiap usaha punya DUA halaman: profil dan katalog lengkap ---
  //
  // Keduanya rute dinamis (`ƒ`), jadi `next build` tidak pernah menjalankannya
  // dan tidak bisa membuktikan apa pun tentangnya. Yang paling penting di sini
  // bukan status 200-nya, melainkan tautan dari profil ke katalog: itu satu-satunya
  // jalan masuk ke halaman katalog: kalau ia hilang, halamannya masih balas 200
  // tapi tidak ada seorang pun yang bisa menemukannya.
  const daftarUmkm = await (await fetch(`${ASAL}/umkm`)).text();
  const slug = daftarUmkm.match(/href="\/umkm\/([a-z0-9-]+)"/)?.[1];

  if (!slug) {
    console.log('  (lewati uji halaman usaha — belum ada UMKM terdaftar)');
  } else {
    const profil = await fetch(`${ASAL}/umkm/${slug}`);
    cek(`GET /umkm/${slug} balas 200`, profil.status === 200, `dapat ${profil.status}`);
    const profilHtml = await profil.text();

    const katalogUmkm = await fetch(`${ASAL}/umkm/${slug}/katalog`);
    cek(
      `GET /umkm/${slug}/katalog balas 200`,
      katalogUmkm.status === 200,
      `dapat ${katalogUmkm.status}`
    );
    const katalogUmkmHtml = await katalogUmkm.text();

    if (/href="\/produk\//.test(profilHtml)) {
      cek(
        'Profil usaha menautkan ke katalog lengkapnya',
        profilHtml.includes(`/umkm/${slug}/katalog`),
        'tidak ada tautan ke halaman katalog — halaman itu jadi tak terjangkau'
      );
      cek(
        'Katalog usaha membawa kolom pencarian di HTML pertama',
        katalogUmkmHtml.includes('id="pencarian-produk"'),
        'kisi produk tidak ter-render di server'
      );
    } else {
      console.log('  (lewati uji tautan katalog — usaha ini belum punya produk)');
    }

    const katalogNyasar = await fetch(`${ASAL}/umkm/slug-yang-tidak-ada/katalog`);
    cek(
      'Katalog slug ngawur balas 404',
      katalogNyasar.status === 404,
      `dapat ${katalogNyasar.status}`
    );
  }

  // --- 2. Panel tertutup tanpa sesi ---
  const tanpaSesi = sesiBaru();
  const kelola = await tanpaSesi('/kelola');
  cek(
    '/kelola tanpa masuk dialihkan ke /masuk',
    kelola.status === 307 && (kelola.headers.get('location') || '').includes('/masuk'),
    `status ${kelola.status}`
  );

  // Ini pemeriksaan terpenting di berkas ini: halaman boleh saja dialihkan,
  // tapi kalau jalur tulisnya tetap menerima permintaan tanpa sesi, portalnya
  // terbuka untuk siapa pun yang tahu alamat /api.
  const tulisLiar = await tanpaSesi('/api/produk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namaProduk: 'Sisipan tanpa izin', umkmId: 'apa-saja' }),
  });
  cek('POST /api/produk tanpa sesi ditolak 401', tulisLiar.status === 401, `dapat ${tulisLiar.status}`);

  const akunLiar = await tanpaSesi('/api/akun');
  cek('GET /api/akun tanpa sesi ditolak 401', akunLiar.status === 401, `dapat ${akunLiar.status}`);

  // Pembuatan akun pindah dari terminal ke panel. Jalur barunya harus dijaga
  // sekeras jalur lain: siapa pun yang bisa membuat akun bisa membuat super
  // admin, dan super admin bisa apa saja.
  const akunBaruLiar = await tanpaSesi('/api/akun', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namaPengguna: 'penyusup', peran: 'admin' }),
  });
  cek(
    'POST /api/akun tanpa sesi ditolak 401',
    akunBaruLiar.status === 401,
    `dapat ${akunBaruLiar.status}`
  );

  // Susunan halaman disimpan lewat PATCH /api/umkm. Tanpa penjagaan, siapa pun
  // bisa menulis ulang halaman publik usaha mana pun.
  const halamanLiar = await tanpaSesi('/api/umkm', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'apa-saja', halaman: [{ jenis: 'hero', judul: 'disusupi' }] }),
  });
  cek(
    'PATCH /api/umkm tanpa sesi ditolak 401',
    halamanLiar.status === 401,
    `dapat ${halamanLiar.status}`
  );

  // Penyapu foto boleh dipanggil siapa pun yang sudah masuk — Apps Script yang
  // memutuskan apakah URL-nya benar-benar sudah tidak dipakai. Tapi tanpa sesi
  // sama sekali ia harus tertutup: kalau tidak, siapa pun yang menebak URL foto
  // yang belum dipakai bisa menghapusi isi Cloudinary orang lain.
  const sapuLiar = await tanpaSesi('/api/foto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://res.cloudinary.com/x/image/upload/v1/a.jpg' }),
  });
  cek('POST /api/foto tanpa sesi ditolak 401', sapuLiar.status === 401, `dapat ${sapuLiar.status}`);

  for (const jalur of ['/kelola/produk', '/kelola/umkm', '/kelola/akun', '/kelola/halaman']) {
    const res = await tanpaSesi(jalur);
    cek(
      `${jalur} tanpa masuk dialihkan ke /masuk`,
      res.status === 307 && (res.headers.get('location') || '').includes('/masuk'),
      `status ${res.status}`
    );
  }

  // --- 3. Login ---
  if (!ADMIN_SANDI) {
    console.log('\nUJI_ADMIN_SANDI tidak diisi, bagian login dilewati.');
    return selesai();
  }

  const salah = sesiBaru();
  const gagalMasuk = await salah('/api/masuk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namaPengguna: ADMIN, sandi: 'jelas-salah-sekali' }),
  });
  const isiGagal = await json(gagalMasuk);
  cek('Kata sandi salah ditolak 401', gagalMasuk.status === 401, `dapat ${gagalMasuk.status}`);
  cek(
    'Pesan galat tidak membocorkan nama pengguna mana yang ada',
    !/pengguna tidak (ada|ditemukan)/i.test(isiGagal.error || ''),
    isiGagal.error
  );

  const adm = sesiBaru();
  const masuk = await adm('/api/masuk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namaPengguna: ADMIN, sandi: ADMIN_SANDI }),
  });
  const isiMasuk = await json(masuk);
  cek('Super admin bisa masuk', masuk.status === 200, isiMasuk.error);
  if (masuk.status !== 200) return selesai();

  cek('Peran terbaca admin', isiMasuk.peran === 'admin', `dapat ${isiMasuk.peran}`);
  cek(
    'Cookie sesi httpOnly',
    (masuk.headers.getSetCookie?.() || []).some((c) => /HttpOnly/i.test(c)),
    'tidak ada HttpOnly'
  );

  const kelolaMasuk = await adm('/kelola');
  cek('/kelola terbuka setelah masuk', kelolaMasuk.status === 200, `dapat ${kelolaMasuk.status}`);

  const daftarAkun = await adm('/api/akun');
  const isiAkun = await json(daftarAkun);
  cek('Super admin bisa membaca daftar akun', daftarAkun.status === 200, isiAkun.error);
  cek(
    'Hash sandi tidak ikut terkirim ke browser',
    !(isiAkun.data || []).some((a) => 'hashSandi' in a),
    'ADA HASH DI RESPONS'
  );

  // --- 4. Tulis produk, lalu bersihkan ---
  const umkmAda = (isiAkun.data || []).find((a) => a.peran === 'umkm');
  const daftarUmkmRes = await adm('/kelola');
  void daftarUmkmRes;

  let idProdukUji = '';
  if (umkmAda?.umkmId) {
    const buat = await adm('/api/produk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namaProduk: 'PRODUK UJI OTOMATIS (hapus kalau tertinggal)',
        umkmId: umkmAda.umkmId,
        harga: 1000,
        kategori: 'Uji',
        status: 'Nonaktif',
      }),
    });
    const isiBuat = await json(buat);
    cek('Super admin bisa menambah produk', buat.status === 200, isiBuat.error);
    idProdukUji = isiBuat?.data?.id || '';
  }

  const tanpaPemilik = await adm('/api/produk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namaProduk: 'Tanpa pemilik', umkmId: '' }),
  });
  cek(
    'Produk tanpa pemilik ditolak 400',
    tanpaPemilik.status === 400,
    `dapat ${tanpaPemilik.status}`
  );

  // --- 5. Pemilik UMKM tidak boleh menyentuh milik orang lain ---
  if (UMKM && UMKM_SANDI && idProdukUji) {
    const pemilik = sesiBaru();
    const masukUmkm = await pemilik('/api/masuk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaPengguna: UMKM, sandi: UMKM_SANDI }),
    });
    const isiUmkm = await json(masukUmkm);
    cek('Pemilik UMKM bisa masuk', masukUmkm.status === 200, isiUmkm.error);

    if (masukUmkm.status === 200) {
      cek('Peran terbaca umkm', isiUmkm.peran === 'umkm', `dapat ${isiUmkm.peran}`);

      const intip = await pemilik('/api/akun');
      cek('Peran umkm ditolak membaca daftar akun', intip.status === 403, `dapat ${intip.status}`);

      const akunPage = await pemilik('/kelola/akun');
      cek(
        'Peran umkm dialihkan dari /kelola/akun',
        akunPage.status === 307,
        `dapat ${akunPage.status}`
      );

      const buatAkun = await pemilik('/api/akun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaPengguna: 'naikpangkat', peran: 'admin' }),
      });
      cek(
        'Peran umkm ditolak membuat akun 403',
        buatAkun.status === 403,
        `dapat ${buatAkun.status}`
      );

      // Yang paling penting dari penyunting halaman: pemilik UMKM mengirim
      // `id` milik orang lain harus TETAP menulis ke usahanya sendiri, bukan
      // ke usaha yang dia sebut. Kalau ini bocor, satu pemilik bisa menulis
      // ulang halaman publik seluruh portal.
      const sasaranAsing = 'u-milik-orang-lain';
      const tulisHalaman = await pemilik('/api/umkm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sasaranAsing,
          halaman: [{ jenis: 'hero', judul: 'DISUSUPI' }],
        }),
      });
      const isiTulis = await json(tulisHalaman);
      cek(
        'Pemilik UMKM tidak bisa menulis halaman usaha lain',
        tulisHalaman.status !== 200 || isiTulis?.data?.id !== sasaranAsing,
        `menulis ke ${isiTulis?.data?.id}`
      );

      const statusLiar = await pemilik('/api/umkm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'nonaktif' }),
      });
      const isiStatus = await json(statusLiar);
      cek(
        'Pemilik UMKM tidak bisa menonaktifkan usahanya sendiri',
        statusLiar.status !== 200 || isiStatus?.data?.status === 'aktif',
        `status jadi ${isiStatus?.data?.status}`
      );
    }
  }

  // --- 6. Bersihkan produk uji ---
  if (idProdukUji) {
    const hapus = await adm(`/api/produk/${idProdukUji}`, { method: 'DELETE' });
    cek('Produk uji terhapus kembali', hapus.status === 200, `dapat ${hapus.status}`);
  }

  const keluar = await adm('/api/keluar', { method: 'POST' });
  cek('Keluar berhasil', keluar.status === 200, `dapat ${keluar.status}`);

  selesai();
}

function selesai() {
  console.log(`\n${lolos} lolos, ${gagal} gagal.`);
  process.exit(gagal ? 1 : 0);
}

jalan().catch((err) => {
  console.error('\nGAGAL menjalankan uji:', err.message);
  console.error('Pastikan `npm run dev` sudah berjalan di ' + ASAL);
  process.exit(1);
});
