'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useInView } from '@/lib/hooks/useInView';
import { formatNumber } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Start immediately instead of waiting for scroll-into-view */
  immediate?: boolean;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Counts from 0 (or the previous value) to `value` when scrolled into view. */
export function AnimatedCounter({ value, durationMs = 1400, decimals = 0, prefix = '', suffix = '', className, immediate = false }: AnimatedCounterProps) {
  const locale = useLocale() as 'ar' | 'en';
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    if (!(inView || immediate)) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = started.current ? fromRef.current : 0;
    started.current = true;
    if (reduce) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const v = from + (value - from) * easeOutCubic(p);
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, inView, immediate, durationMs]);

  return (
    <span ref={ref} className={cn('num', className)}>
      {prefix}
      {formatNumber(display, locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
