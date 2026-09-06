import type { CorridorRateSummary } from '@/lib/api/rates';
import { cn } from '@/lib/utils/helpers';
import { CorridorCard } from './CorridorCard';

export function CorridorGrid({ summaries, variant = 'compact', className, locale }: { summaries: CorridorRateSummary[]; variant?: 'compact' | 'detailed'; className?: string; locale: 'ar' | 'en' }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {summaries.map((s, i) => (
        <div key={s.corridor.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
          <CorridorCard
            corridor={s.corridor}
            midMarketRate={s.midMarketRate}
            changePercent={s.change24hPercent}
            servicesCount={s.servicesCount}
            bestServiceName={locale === 'ar' ? s.bestServiceNameAr : s.bestServiceName}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );
}
