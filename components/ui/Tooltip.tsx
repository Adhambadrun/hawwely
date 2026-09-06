'use client';

import { useId, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export function Tooltip({ content, children, className }: { content: ReactNode; children?: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-describedby={id}
        aria-label="info"
        className="inline-flex items-center text-content-secondary hover:text-navy focus:outline-none"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
      >
        {children ?? <Info className="h-4 w-4" />}
      </button>
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute bottom-full start-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-btn bg-navy px-3 py-2 text-caption leading-relaxed text-white shadow-modal transition-opacity rtl:translate-x-1/2',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
