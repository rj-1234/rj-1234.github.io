import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { loadClouds2 } from '../../lib/vanta-loader';
import { viewStore } from '../../lib/store';

export default function MetricsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);
  const view = useStore(viewStore);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadClouds2().then((CLOUDS2) => {
      if (cancelled || !ref.current) return;
      effectRef.current = CLOUDS2({
        el: ref.current,
        backgroundColor: 0xefe9de,
        backgroundAlpha: 1,
        skyColor: 0xefe9de,
        cloudColor: 0xcc785c,
        lightColor: 0xe8a55a,
        speed: 1,
        texturePath: '/assets/noise.png',
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

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-0 opacity-40"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 25%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%)',
      }}
    />
  );
}
