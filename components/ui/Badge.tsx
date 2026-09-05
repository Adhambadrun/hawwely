import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'navy' | 'outline' | 'live';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-navy-50 text-navy',
  success: 'bg-primary-50 text-primary-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-danger',
  info: 'bg-blue-50 text-blue-700',
  gold: 'bg-gold/20 text-amber-800',
  navy: 'bg-navy text-white',
  outline: 'border border-card-border bg-white text-content-secondary',
  live: 'bg-red-50 text-danger',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn('badge', variants[variant], className)} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
