'use client';

import { useEffect, useState } from 'react';
import FormProduk from '@/components/FormProduk';
import FormProfil from '@/components/FormProfil';
import ThemeToggle from '@/components/ThemeToggle';
import { ambilProdukSemua, formatRupiah, hapusProduk, normalisasiFotoUrl } from '@/lib/api';
import type { Produk } from '@/lib/types';

const KUNCI_TOKEN = 'katalog_admin_token';

export default function HalamanAdmin() {
  const [token, setToken] = useState<string | null>(null);
  const [siapMemeriksaSesi, setSiapMemeriksaSesi] = useState(false);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [memuat, setMemuat] = useState(false);
  const [error, setError] = useState('');
  const [sedangDiedit, setSedangDiedit] = useState<Produk | null | undefined>(undefined);
  const [editProfil, setEditProfil] = useState(false);

  useEffect(() => {
    const tersimpan = sessionStorage.getItem(KUNCI_TOKEN);
    if (tersimpan) masuk(tersimpan, true);
    else setSiapMemeriksaSesi(true);
  }, []);

  async function masuk(password: string, diamDiam = false) {
    setMemuat(true);
    setError('');
    try {
      const data = await ambilProdukSemua(password);
      setToken(password);
      setProduk(data);
      sessionStorage.setItem(KUNCI_TOKEN, password);
    } catch (err) {
      if (!diamDiam) setError(err instanceof Error ? err.message : String(err));
      sessionStorage.removeItem(KUNCI_TOKEN);
    } finally {
      setMemuat(false);
      setSiapMemeriksaSesi(true);
    }
  }

  async function muatUlang() {
    if (!token) return;
    setMemuat(true);
    try {
      setProduk(await ambilProdukSemua(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setMemuat(false);
    }
  }

  async function hapus(p: Produk) {
    if (!token) return;
    if (!confirm(`"${p.namaProduk}" dan fotonya akan dihapus permanen. Lanjutkan?`)) return;
    try {
      await hapusProduk(token, p.id);
      muatUlang();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  function keluar() {
    sessionStorage.removeItem(KUNCI_TOKEN);
    setToken(null);
    setProduk([]);
  }

  if (!siapMemeriksaSesi) {
    return <p className="py-24 text-center font-display text-2xl italic text-ink/65">Memeriksa sesi...</p>;
  }

  if (!token) {
    return <FormLogin memuat={memuat} error={error} onSubmit={(pw) => masuk(pw)} />;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink">Panel admin</h1>
          <p className="mt-1 font-body text-sm text-ink/65">
            {produk.length} produk tersimpan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setEditProfil((v) => !v)}
            className="rounded-full border border-ink/20 px-4 py-1.5 font-body text-sm text-ink/70 transition-colors hover:border-accent hover:text-ink"
          >
            {editProfil ? 'Tutup profil' : 'Edit profil'}
          </button>
          <button
            onClick={keluar}
            className="rounded-full border border-ink/20 px-4 py-1.5 font-body text-sm text-ink/70 transition-colors hover:border-ink/40"
          >
            Keluar
          </button>
        </div>
      </div>

      {editProfil && (
        <div className="mt-8">
          <FormProfil token={token} onSelesai={() => setEditProfil(false)} />
        </div>
      )}

      <div className="mt-8">
        {sedangDiedit !== undefined ? (
          <FormProduk
            token={token}
            produkAwal={sedangDiedit}
            onBatal={() => setSedangDiedit(undefined)}
            onTersimpan={() => {
              setSedangDiedit(undefined);
              muatUlang();
            }}
          />
        ) : (
          <button
            onClick={() => setSedangDiedit(null)}
            className="rounded-full bg-accent px-6 py-3 font-body font-semibold text-accent-ink transition-colors hover:bg-accent-strong"
          >
            + Tambah produk
          </button>
        )}
      </div>

      <div className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/12 bg-surface">
        {produk.map((p) => {
          const foto = normalisasiFotoUrl(p.foto, 200);
          return (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink/10">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-xl italic text-ink/40">
                    {p.namaProduk.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-semibold text-ink">{p.namaProduk}</h3>
                <p className="truncate font-body text-sm text-ink/65">
                  {p.namaUmkm} &middot; {p.kategori} &middot; {formatRupiah(p.harga)}
                </p>
              </div>

              <span
                className={`hidden shrink-0 rounded-full px-3 py-1 font-body text-xs sm:inline ${
                  p.status === 'Aktif' ? 'bg-accent/15 text-accent-strong' : 'bg-ink/10 text-ink/50'
                }`}
              >
                {p.status}
              </span>

              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setSedangDiedit(p)}
                  className="rounded-full px-3 py-1.5 font-body text-sm text-ink/70 transition-colors hover:bg-bg hover:text-ink"
                >
                  Ubah
                </button>
                <button
                  onClick={() => hapus(p)}
                  className="rounded-full px-3 py-1.5 font-body text-sm text-ink/50 transition-colors hover:bg-bg hover:text-accent"
                >
                  Hapus
                </button>
              </div>
            </div>
          );
        })}
        {produk.length === 0 && !memuat && (
          <p className="p-10 text-center font-body text-ink/65">
            Katalog masih kosong. Pilih &ldquo;Tambah produk&rdquo; untuk menambahkan
            produk pertama.
          </p>
        )}
      </div>
    </main>
  );
}

function FormLogin({
  memuat,
  error,
  onSubmit,
}: {
  memuat: boolean;
  error: string;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState('');
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-ink/12 bg-surface p-8">
        <h1 className="font-display text-4xl font-semibold text-ink">Panel admin</h1>
        <p className="mt-2 font-body text-sm text-ink/65">
          Masukkan kata sandi yang diatur melalui menu Katalog Admin di Google Sheets.
        </p>
        <form
          className="mt-7 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(password);
          }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata sandi admin"
            className="rounded-xl border border-ink/15 bg-bg px-4 py-2.5 font-body text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
          />
          {error && <p className="font-body text-sm text-accent">{error}</p>}
          <button
            type="submit"
            disabled={memuat}
            className="rounded-full bg-accent px-4 py-2.5 font-body font-semibold text-accent-ink transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {memuat ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </main>
  );
}
