import { useEffect, useRef } from 'react';
import { loadBirds } from '../../lib/vanta-loader';

export default function HeroBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadBirds().then((BIRDS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = BIRDS({
        el: ref.current,
        backgroundColor: 0xfaf9f5,
        color1: 0xcc785c,
        color2: 0xe8a55a,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-60" />;
}
