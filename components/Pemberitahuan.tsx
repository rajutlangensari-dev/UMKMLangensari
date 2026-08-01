'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Pemberitahuan setelah aksi berhasil.
 *
 * Ada karena sebelumnya menyimpan produk hanya menutup formulir, tanpa tanda apa
 * pun bahwa datanya masuk. Orang yang tidak yakin akan menekan Simpan sekali
 * lagi, lalu sekali lagi.
 *
 * Pesannya menyebut BENDA dan TINDAKANNYA ("Kalung Rajut tersimpan"), bukan
 * "Berhasil". Yang perlu diyakinkan adalah bahwa hal yang tepat yang tersimpan,
 * bukan bahwa ada sesuatu yang berhasil.
 *
 * `role="status"` + `aria-live="polite"` supaya pembaca layar ikut mengumumkan
 * tanpa memotong apa yang sedang dibaca.
 */

type Kirim = (pesan: string) => void;
const Konteks = createContext<Kirim>(() => {});

export function useKabar(): Kirim {
  return useContext(Konteks);
}

interface Kabar {
  id: number;
  pesan: string;
}

export function PenyediaKabar({ children }: { children: React.ReactNode }) {
  const [antre, setAntre] = useState<Kabar[]>([]);

  const kirim = useCallback((pesan: string) => {
    setAntre((a) => [...a, { id: Date.now() + Math.random(), pesan }]);
  }, []);

  return (
    <Konteks.Provider value={kirim}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {antre.map((k) => (
          <Satu key={k.id} kabar={k} onSelesai={() => setAntre((a) => a.filter((x) => x.id !== k.id))} />
        ))}
      </div>
    </Konteks.Provider>
  );
}

function Satu({ kabar, onSelesai }: { kabar: Kabar; onSelesai: () => void }) {
  useEffect(() => {
    const t = setTimeout(onSelesai, 4000);
    return () => clearTimeout(t);
  }, [onSelesai]);

  return (
    <div className="pemberitahuan pointer-events-auto flex max-w-sm items-center gap-3 rounded-full border border-line bg-paper py-2 pl-4 pr-2 shadow-[0_12px_32px_rgb(0_0_0/0.12)]">
      <span className="font-body text-sm text-ink">{kabar.pesan}</span>
      <button
        type="button"
        onClick={onSelesai}
        aria-label="Tutup pemberitahuan"
        className="tekan flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3 w-3">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
    </div>
  );
}
