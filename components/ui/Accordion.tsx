'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({ items, defaultOpen, className }: { items: AccordionItem[]; defaultOpen?: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  return (
    <div className={cn('divide-y divide-card-border rounded-card border border-card-border bg-white', className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${item.id}-panel`}
                id={`${item.id}-button`}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-body font-semibold text-navy transition hover:bg-surface"
              >
                <span>{item.title}</span>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-content-secondary transition-transform duration-200', isOpen && 'rotate-180')} aria-hidden />
              </button>
            </h3>
            <div
              id={`${item.id}-panel`}
              role="region"
              aria-labelledby={`${item.id}-button`}
              className={cn('grid transition-[grid-template-rows] duration-200 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-small leading-relaxed text-content-secondary">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
