import { useEffect } from 'react';
import Lenis from 'lenis';
import { initLenisGSAP, createSectionSlides } from '../lib/animations';

export default function LenisProvider() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({ autoRaf: false });
    initLenisGSAP(lenis);
    createSectionSlides();

    return () => lenis.destroy();
  }, []);

  return null;
}
