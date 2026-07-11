import { useEffect, useRef } from 'react';
import { loadDots } from '../../lib/vanta-loader';

export default function SkillsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadDots().then((DOTS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = DOTS({
        el: ref.current,
        backgroundColor: 0xefe9de,
        color: 0xcc785c,
        color2: 0xe8a55a,
        size: 3,
        showLines: false,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-35" />;
}
