import { Skeleton } from '@/components/ui/Skeleton';

export default function LocaleLoading() {
  return (
    <div className="container-content section" role="status" aria-label="loading">
      <Skeleton className="h-10 w-2/3 max-w-lg" />
      <Skeleton className="mt-4 h-5 w-1/2 max-w-md" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-card" />
        ))}
      </div>
    </div>
  );
}
