import { Globe, ShieldCheck, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/helpers';

export function TrustSignals({ className, dark = true }: { className?: string; dark?: boolean }) {
  const t = useTranslations('hero');
  const items = [
    { icon: Star, label: t('trustComparisons') },
    { icon: Globe, label: t('trustCountries') },
    { icon: ShieldCheck, label: t('trustFree') },
  ];
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className={cn('flex items-center gap-2 text-small font-semibold', dark ? 'text-white/85' : 'text-navy')}>
          <Icon className={cn('h-4 w-4', dark ? 'text-gold' : 'text-primary')} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
