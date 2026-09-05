'use client';

import { cn } from '@/lib/utils/helpers';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md',
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: TabOption<T>[];
  className?: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-card bg-navy-50 p-1 scrollbar-none', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'whitespace-nowrap rounded-btn font-semibold transition-all',
              size === 'sm' ? 'px-3 py-1.5 text-caption' : 'px-4 py-2 text-small',
              active ? 'bg-white text-navy shadow-card' : 'text-content-secondary hover:text-navy',
            )}
          >
            {o.label}
            {o.count != null && <span className={cn('ms-1.5 rounded-pill px-1.5 text-caption', active ? 'bg-primary-50 text-primary-700' : 'bg-white/60')}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
