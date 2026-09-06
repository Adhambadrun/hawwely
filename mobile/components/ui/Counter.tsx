import { useEffect, useState } from 'react';
import { Text, type TextProps } from './Text';
import { formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

/** Number that counts up to `value` on mount / change (600 ms ease-out). */
export function Counter({ value, decimals = 0, suffix = '', prefix = '', ...rest }: { value: number; decimals?: number; suffix?: string; prefix?: string } & TextProps) {
  const [display, setDisplay] = useState(value);
  const lang = useLang();
  useEffect(() => {
    const from = display;
    const to = value;
    if (from === to) return;
    const start = Date.now();
    const dur = 600;
    let raf: ReturnType<typeof requestAnimationFrame>;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <Text variant="numHero" ltr {...rest}>
      {prefix}
      {formatNumber(display, lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </Text>
  );
}
