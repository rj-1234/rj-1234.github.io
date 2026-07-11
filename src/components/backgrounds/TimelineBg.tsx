import { useEffect, useRef } from 'react';
import { loadWaves } from '../../lib/vanta-loader';

export default function TimelineBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadWaves().then((WAVES) => {
      if (cancelled || !ref.current) return;
      effectRef.current = WAVES({
        el: ref.current,
        backgroundColor: 0xfaf9f5,
        color: 0xe6dfd8,
        shininess: 85,
        waveHeight: 15,
        waveSpeed: 1.45,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-50" />;
}
