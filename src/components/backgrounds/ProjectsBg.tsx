import { useEffect, useRef } from 'react';
import { loadNet } from '../../lib/vanta-loader';

export default function ProjectsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadNet().then((NET) => {
      if (cancelled || !ref.current) return;
      effectRef.current = NET({
        el: ref.current,
        backgroundColor: 0xfaf9f5,
        color: 0xcc785c,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-30" />;
}
