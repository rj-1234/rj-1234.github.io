import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { loadClouds } from '../../lib/vanta-loader';
import { viewStore } from '../../lib/store';

export default function MetricsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);
  const view = useStore(viewStore);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadClouds().then((CLOUDS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = CLOUDS({
        el: ref.current,
        backgroundColor: 0xefe9de,
        cloudColor: 0xcc785c,
        sunColor: 0xe8a55a,
        sunGlareColor: 0xe8a55a,
        sunlightColor: 0xe8a55a,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const timers = [150, 500, 1000].map((delay) =>
      setTimeout(() => effectRef.current?.resize(), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [view]);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-40" />;
}
