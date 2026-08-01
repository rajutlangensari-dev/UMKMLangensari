/**
 * Pencocokan yang dipakai semua daftar panel: tidak peduli huruf besar-kecil,
 * banyak kolom sekaligus.
 *
 * BERKAS INI SENGAJA TIDAK BERTANDA `'use client'`, dan itu bukan kelalaian.
 *
 * Sebelumnya fungsi ini tinggal di `Cari.tsx` yang bertanda `'use client'`.
 * Next.js mengubah SELURUH ekspor modul klien jadi referensi klien saat diimpor
 * dari Server Component — termasuk fungsi biasa yang tidak ada hubungannya
 * dengan React. Gejalanya:
 *
 *     TypeError: (0 , _Cari__WEBPACK_IMPORTED_MODULE__.cocok) is not a function
 *
 * dan ia TIDAK tertangkap `tsc`, `next lint`, maupun `next build`, karena
 * seluruh halaman panel bersifat dinamis (`ƒ`) sehingga tidak pernah dijalankan
 * saat build. Baru muncul saat halamannya benar-benar dibuka.
 *
 * Aturannya: penolong murni yang dipakai server DAN klien tinggal di berkas
 * tanpa `'use client'`. Berkas klien boleh mengimpornya; sebaliknya tidak.
 */
export function cocok(kunci: string, ...kolom: (string | undefined)[]): boolean {
  const k = kunci.trim().toLowerCase();
  if (!k) return true;
  return kolom.some((c) => (c || '').toLowerCase().includes(k));
}
