import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/helpers';

export function PageHeader({ title, subtitle, children, className, tone = 'navy', eyebrow }: { title: ReactNode; subtitle?: ReactNode; children?: ReactNode; className?: string; tone?: 'navy' | 'light'; eyebrow?: ReactNode }) {
  const dark = tone === 'navy';
  return (
    <section className={cn(dark ? 'bg-navy-gradient text-white' : 'border-b border-card-border bg-white text-navy', className)}>
      <div className="container-content py-10 md:py-14">
        {eyebrow && <div className="mb-3">{eyebrow}</div>}
        <h1 className="text-balance text-hero-m font-extrabold md:text-4xl">{title}</h1>
        {subtitle && <p className={cn('mt-3 max-w-2xl text-body', dark ? 'text-white/80' : 'text-content-secondary')}>{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
