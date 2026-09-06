import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section' | 'li';
}

const paddings = { none: 'p-0', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ className, hover = false, padding = 'md', as = 'div', ...props }: CardProps) {
  const Tag = as as 'div';
  return <Tag className={cn('rounded-card border border-card-border bg-card shadow-card', paddings[padding], hover && 'card-hover', className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-bold text-navy', className)} {...props} />;
}
