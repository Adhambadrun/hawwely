import { Clock, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import type { TransferSpeed } from '@/lib/types';

export function SpeedBadge({ speed, minutes, className }: { speed: TransferSpeed | string; minutes?: number; className?: string }) {
  const t = useTranslations('speed');
  const fast = (minutes ?? 9999) <= 60 || speed === 'minutes';
  const Icon = fast ? Zap : Clock;
  const label = t.has(speed as never) ? t(speed as never) : speed;
  return (
    <Badge variant={fast ? 'success' : 'default'} className={className}>
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}
