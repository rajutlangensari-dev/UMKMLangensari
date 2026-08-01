import FormMasuk from './FormMasuk';

// Halaman pembungkus, ada supaya judul tab bisa disetel. Formulirnya butuh state
// dan harus berjalan di klien, dan komponen klien tidak boleh mengekspor metadata.
export const metadata = {
  title: 'Masuk',
  // Halaman panel tidak ada gunanya di hasil pencarian, dan tautannya tidak
  // pernah dibagikan ke siapa pun.
  robots: { index: false, follow: false },
};

export default function HalamanMasuk() {
  return <FormMasuk />;
}
