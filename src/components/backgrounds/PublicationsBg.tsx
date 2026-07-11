import { useEffect, useRef } from 'react';
import { loadCells } from '../../lib/vanta-loader';

export default function PublicationsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadCells().then((CELLS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = CELLS({
        el: ref.current,
        backgroundColor: 0xefe9de,
        color1: 0xcc785c,
        color2: 0xe8a55a,
        size: 0.8,
        speed: 0.4,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-30" />;
}
