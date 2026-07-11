import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { METRICS, type Metric } from '../lib/constants';
import { viewStore } from '../lib/store';
import { counterValue } from '../lib/counter-animation';
import MetricsBg from './backgrounds/MetricsBg';

function AnimatedMetric({ metric }: { metric: Metric }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const value = counterValue(now - start, 1200, metric.value);
        setDisplay(metric.value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1));
        if (now - start < 1200) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDisplay(String(metric.value));
        }
      };
      rafId = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [metric.value]);

  const sizeClass = {
    hero: 'col-span-2 row-span-2 text-display-lg',
    large: 'col-span-2 text-display-md',
    medium: 'text-display-sm',
    small: 'text-title-lg',
  }[metric.size];

  return (
    <div ref={ref} className={`bg-surface-0 rounded-lg p-6 ${sizeClass}`}>
      <div className="font-display">{display}{metric.suffix}</div>
      <div className="text-title-sm mt-2">{metric.label}</div>
      <div className="text-body-sm text-muted mt-1">{metric.sublabel}</div>
      {useStore(viewStore) === 'technical' && (
        <div className="text-caption text-muted-soft mt-2">{metric.detail}</div>
      )}
    </div>
  );
}

export default function MetricsDashboard() {
  const view = useStore(viewStore);
  const shown = view === 'executive' ? METRICS.filter((m) => m.executive) : METRICS;

  return (
    <section id="impact" data-slide className="relative section-padding bg-surface-1 overflow-hidden">
      <MetricsBg />
      <div data-slide-inner className="container-main relative z-10">
        <h2 className="font-display text-display-lg">Impact at Scale</h2>
        <p className="text-body-md text-body mt-2">Production systems processing billions of requests with enterprise-grade reliability.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {shown.map((metric) => <AnimatedMetric key={metric.id} metric={metric} />)}
        </div>
      </div>
    </section>
  );
}
