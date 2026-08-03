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
        className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
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
    <div className="pemberitahuan pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-kartu border border-line bg-paper py-2 pl-4 pr-1 shadow-sm sm:w-auto sm:rounded-full sm:pr-2">
      <span className="min-w-0 flex-1 font-body text-base leading-snug text-ink sm:text-sm">{kabar.pesan}</span>
      <button
        type="button"
        onClick={onSelesai}
        aria-label="Tutup pemberitahuan"
        className="tekan flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-ink sm:h-9 sm:w-9"
      >
        <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3 w-3">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
    </div>
  );
}
