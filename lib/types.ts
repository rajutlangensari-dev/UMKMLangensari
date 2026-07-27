export interface Produk {
  id: string;
  namaProduk: string;
  kategori: string;
  harga: number;
  stok: string;
  deskripsi: string;
  foto: string;
  kontakWa: string;
  namaUmkm: string;
  alamat: string;
  status: string;
}

export type ProdukBaru = Omit<Produk, 'id'>;

// Profil toko yang tampil di halaman /tentang, diedit dari admin seperti profil Instagram.
export interface Profil {
  namaToko: string;
  bio: string;
  foto: string;
  kontakWa: string;
  alamat: string;
}
