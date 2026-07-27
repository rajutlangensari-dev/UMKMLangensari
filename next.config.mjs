/** @type {import('next').NextConfig} */
// Tidak ada `images.remotePatterns` di sini dengan sengaja. Foto produk dirender
// dengan <img> biasa, bukan next/image, karena sumbernya Cloudinary dan Google
// Drive yang URL-nya diisi manual lewat panel admin. Ukurannya sudah dipotong di
// sisi Cloudinary lewat normalisasiFotoUrl() di lib/api.ts.
//
// Versi sebelumnya mendaftarkan host Google Drive di sini. Daftar itu tidak
// pernah terpakai (next/image tidak dipanggil di mana pun) dan menyesatkan
// pembaca berikutnya, jadi dibuang. Kalau nanti pindah ke next/image, daftarkan
// `res.cloudinary.com` DAN `drive.google.com` sekaligus.
const nextConfig = {};

export default nextConfig;
