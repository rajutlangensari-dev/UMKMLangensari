import type { CSSProperties, ReactNode } from 'react';
import { atributTema, gayaTema, type TataLetak, type Tema } from '@/lib/blok';

/**
 * Satu sumber untuk memasang tema dan preset layout pada halaman publik maupun
 * pratinjau panel. Tema bebas memakai custom property yang sudah diamankan;
 * tema preset tetap mengandalkan selector statis di globals.css.
 */
export default function BingkaiTemaUmkm({
  tema,
  tataLetak,
  className,
  children,
}: {
  tema?: Tema;
  tataLetak?: TataLetak;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-tema={atributTema(tema)}
      data-tata-letak={tataLetak}
      style={gayaTema(tema) as CSSProperties | undefined}
      className={className}
    >
      {children}
    </div>
  );
}
