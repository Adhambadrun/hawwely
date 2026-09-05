'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLocale, useTranslations } from 'next-intl';
import type { RateHistoryPoint } from '@/lib/types';
import { formatRate } from '@/lib/utils/formatters';

export interface RateChartProps {
  points: RateHistoryPoint[];
  currency: string;
  /** Show the service's rate line in addition to mid-market */
  showService?: boolean;
  serviceName?: string;
  height?: number;
  className?: string;
}

export function RateChart({ points, currency, showService = false, serviceName, height = 280, className }: RateChartProps) {
  const t = useTranslations('rates');
  const locale = useLocale() as 'ar' | 'en';
  const isRtl = locale === 'ar';

  const data = useMemo(
    () =>
      points.map((p) => ({
        ts: new Date(p.recorded_at).getTime(),
        mid: p.mid_market_rate,
        svc: p.exchange_rate,
      })),
    [points],
  );

  const spanMs = data.length ? data[data.length - 1].ts - data[0].ts : 0;
  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', spanMs <= 2 * 86400e3 ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' });
  const fullFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  const values = data.flatMap((d) => (showService ? [d.mid, d.svc] : [d.mid]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min || max * 0.01) * 0.25;
  const decimals = max >= 100 ? 2 : max >= 10 ? 3 : 4;

  if (data.length === 0) return null;

  return (
    <div className={className} dir="ltr" role="img" aria-label={`${currency}/EGP chart`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: isRtl ? 8 : 16, left: isRtl ? 16 : 8, bottom: 0 }}>
          <defs>
            <linearGradient id="midFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C853" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#00C853" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v: number) => dateFmt.format(v)}
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            reversed={isRtl}
          />
          <YAxis
            domain={[min - pad, max + pad]}
            tickFormatter={(v: number) => formatRate(v, locale, decimals)}
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            width={64}
            orientation={isRtl ? 'right' : 'left'}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', fontSize: 12, direction: isRtl ? 'rtl' : 'ltr' }}
            labelFormatter={(v) => fullFmt.format(Number(v))}
            formatter={(value: number, name: string) => [formatRate(value, locale, decimals), name === 'mid' ? t('midMarketLine') : serviceName ?? t('bestLine')]}
          />
          {showService && <Legend formatter={(v) => (v === 'mid' ? t('midMarketLine') : serviceName ?? t('bestLine'))} wrapperStyle={{ fontSize: 12 }} />}
          <Area type="monotone" dataKey="mid" stroke="#00C853" strokeWidth={2.5} fill="url(#midFill)" dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
          {showService && <Line type="monotone" dataKey="svc" stroke="#1B2A4A" strokeWidth={2} dot={false} strokeDasharray="6 4" isAnimationActive={false} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
