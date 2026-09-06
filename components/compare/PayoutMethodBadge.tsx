import { Banknote, Landmark, Smartphone, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import type { PayoutMethod } from '@/lib/types';

const icons = { bank_transfer: Landmark, cash_pickup: Banknote, mobile_wallet: Smartphone, instapay: Zap } as const;

export function PayoutMethodBadge({ method, className }: { method: PayoutMethod; className?: string }) {
  const t = useTranslations('payout');
  const Icon = icons[method] ?? Landmark;
  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3" aria-hidden />
      {t(method)}
    </Badge>
  );
}

export function PayoutMethods({ methods, className }: { methods: PayoutMethod[]; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap gap-1 ${className ?? ''}`}>
      {methods.map((m) => (
        <PayoutMethodBadge key={m} method={m} />
      ))}
    </span>
  );
}
