'use client';

import { useEffect, useState } from 'react';

/**
 * Apakah pengguna meminta gerak dikurangi?
 *
 * Ada sebagai hook, bukan fungsi yang dipanggil sekali, karena dua alasan:
 *
 * 1. **Setelannya bisa berubah saat halaman terbuka.** Orang menyalakan
 *    "kurangi gerak" justru KETIKA sesuatu mulai membuatnya pusing, bukan
 *    sebelumnya. Versi fungsi biasa membaca nilainya sekali lalu tidak pernah
 *    tahu, jadi carousel tetap berjalan sendiri sampai halaman dimuat ulang.
 * 2. **`window.matchMedia` tidak ada di server.** Memanggilnya sembarangan
 *    membuat render server gagal; di sini ia hanya disentuh di dalam efek.
 *
 * Nilai awalnya `false`, jadi render server dan render klien pertama sama —
 * kalau berbeda, React akan mengeluh soal hidrasi. Pembacaan sebenarnya terjadi
 * tepat setelahnya, sebelum satu pun animasi otomatis sempat berjalan.
 */
export function useKurangiGerak(): boolean {
  const [kurangi, setKurangi] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ubah = () => setKurangi(media.matches);
    ubah();
    media.addEventListener('change', ubah);
    return () => media.removeEventListener('change', ubah);
  }, []);

  return kurangi;
}
