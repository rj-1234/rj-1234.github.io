import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initLenisGSAP(lenis: Lenis): void {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function createSectionSlides(): void {
  const panels = gsap.utils.toArray<HTMLElement>('[data-slide]');
  panels.pop(); // last section (Contact) is not pinned/slid

  panels.forEach((panel) => {
    const inner = panel.querySelector<HTMLElement>('[data-slide-inner]');
    if (!inner) return;

    const isTaller = inner.getBoundingClientRect().height > window.innerHeight;
    if (isTaller) {
      panel.style.marginBottom = `${inner.getBoundingClientRect().height - window.innerHeight}px`;
    }

    const fakeScroll = { y: 0 };
    gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top top',
        end: () => `+=${window.innerHeight}`,
        scrub: true,
        pin: true,
        pinSpacing: false,
      },
    })
      .to(fakeScroll, { y: window.innerHeight, yPercent: -100, ease: 'none' }, 0)
      .to(panel, { scale: 0.7, opacity: 0.5, ease: 'none' }, 0)
      .to(panel, { opacity: 0, ease: 'none' }, 0.5);
  });
}

export function createTimelineAnimation(): void {
  const cards = gsap.utils.toArray<HTMLElement>('[data-timeline-card]');
  cards.forEach((card, i) => {
    const fromLeft = i % 2 === 0;
    gsap.from(card, {
      x: fromLeft ? -60 : 60,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
    });
  });
}
