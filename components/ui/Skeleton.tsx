import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/helpers';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden {...props} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="card" aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-card" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-8 w-20 rounded-pill" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-11 flex-1 rounded-btn" />
        <Skeleton className="h-11 w-32 rounded-btn" />
      </div>
    </div>
  );
}

export function ResultsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="loading">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card', className)} aria-hidden>
      <Skeleton className="mb-4 h-4 w-1/3" />
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}
