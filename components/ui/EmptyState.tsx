import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('card flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 -m-4 rounded-full bg-primary-50" aria-hidden />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-card">{icon ?? <Inbox className="h-8 w-8" />}</div>
      </div>
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-small text-content-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
