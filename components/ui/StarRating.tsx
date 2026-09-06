'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  label?: string;
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-8 w-8' };

export function StarRating({ value, onChange, size = 'md', showValue = false, className, label }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = hover ?? value;

  return (
    <div className={cn('inline-flex items-center gap-1', className)} role={interactive ? 'radiogroup' : 'img'} aria-label={label ?? `${value} / 5`}>
      <div className="flex items-center gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.min(1, Math.max(0, display - (i - 1)));
          const star = (
            <span className="relative inline-block" key={i}>
              <Star className={cn(sizes[size], 'text-navy-200')} aria-hidden />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }} aria-hidden>
                <Star className={cn(sizes[size], 'fill-gold text-gold')} />
              </span>
            </span>
          );
          if (!interactive) return star;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={value === i}
              aria-label={`${i}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onChange?.(i)}
              className="rounded transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary"
            >
              {star}
            </button>
          );
        })}
      </div>
      {showValue && <span className="num ms-1 text-small font-semibold text-navy">{value.toFixed(1)}</span>}
    </div>
  );
}
