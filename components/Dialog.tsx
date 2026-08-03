'use client';

import { useEffect, useRef } from 'react';

/**
 * Dialog konfirmasi portal, pengganti `confirm()` bawaan.
 *
 * Kenapa diganti: di HP, kotak `confirm()` bertuliskan nama host di atasnya —
 * "langensari.vercel.app says" — bukan nama portal. Ia juga tidak bisa menyebut
 * akibat dengan kalimat lengkap, dan tombolnya selalu "OK/Cancel", bukan kata
 * kerja yang menerangkan apa yang akan terjadi.
 *
 * Dibangun di atas `<dialog>` bawaan, bukan pustaka. Elemen itu sudah membawa
 * perangkap fokus, tutup lewat Escape, dan lapisan ::backdrop — tiga hal yang
 * paling sering salah kalau ditulis sendiri, dan salahnya baru ketahuan saat
 * ada yang mencoba memakainya dengan papan ketik.
 */
export default function Dialog({
  buka,
  judul,
  keterangan,
  teksIya,
  merusak = true,
  sibuk,
  onIya,
  onBatal,
}: {
  buka: boolean;
  judul: string;
  /** Sebutkan APA yang akan terjadi, bukan "Anda yakin?". */
  keterangan: React.ReactNode;
  /** Kata kerja aksinya: "Hapus produk", bukan "OK". */
  teksIya: string;
  merusak?: boolean;
  sibuk?: boolean;
  onIya: () => void;
  onBatal: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const batalRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (buka && !d.open) {
      d.showModal();
      // Fokus awal jatuh ke BATAL, bukan ke tombol yang menghapus. Enter refleks
      // setelah dialog muncul tidak boleh menghancurkan apa pun.
      batalRef.current?.focus();
    } else if (!buka && d.open) {
      d.close();
    }
  }, [buka]);

  return (
    <dialog
      ref={ref}
      // Escape memicu `cancel`, dan tanpa ini state React tidak ikut tahu
      // dialognya sudah tertutup — bukaan berikutnya jadi tidak terjadi.
      onCancel={(e) => {
        e.preventDefault();
        if (!sibuk) onBatal();
      }}
      onClose={onBatal}
      aria-labelledby="judul-dialog"
      className="kotak m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-kartu border border-line bg-paper p-0 text-ink backdrop:bg-black/45"
    >
      <div className="p-5 sm:p-7">
        <h2 id="judul-dialog" className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
          {judul}
        </h2>
        <div className="mt-2.5 font-body text-base leading-relaxed text-muted text-pretty sm:text-sm">
          {keterangan}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onIya}
            disabled={sibuk}
            className={`tekan min-h-12 w-full rounded-full px-6 font-body text-base font-semibold transition-[transform,background-color] duration-150 ease-out disabled:opacity-60 sm:min-h-11 sm:w-auto sm:text-sm ${
              merusak
                ? 'bg-ink text-paper hover:bg-ink/85'
                : 'bg-aksen text-aksen-ink hover:bg-aksen-kuat'
            }`}
          >
            {sibuk ? 'Memproses...' : teksIya}
          </button>
          <button
            ref={batalRef}
            type="button"
            onClick={onBatal}
            disabled={sibuk}
            className="tekan min-h-12 w-full rounded-full border border-line px-6 font-body text-base text-muted transition-[transform,border-color,color] duration-150 ease-out hover:border-aksen hover:text-ink disabled:opacity-60 sm:min-h-11 sm:w-auto sm:text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </dialog>
  );
}
