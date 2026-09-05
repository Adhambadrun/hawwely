'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import type { RateHistoryPoint } from '@/lib/types';
import { LIVE_REFRESH_MS } from '@/lib/utils/constants';

export interface CorridorRateDto {
  currency: string;
  country: string;
  country_ar: string;
  flag: string;
  corridor_id: string;
  mid_market_rate: number;
  best_rate: number;
  best_service_slug: string | null;
  best_service_name: string | null;
  best_service_name_ar: string | null;
  change_24h_percent: number;
  high_24h: number;
  low_24h: number;
  services_count: number;
}

export interface RatesDto {
  rates: CorridorRateDto[];
  updated_at: string;
  source: 'live' | 'demo';
}

/** Polls /api/rates every 5 minutes (pauses when tab is hidden). */
export function useLiveRates(initial: RatesDto | null = null, refreshMs = LIVE_REFRESH_MS) {
  const [data, setData] = useState<RatesDto | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(initial ? new Date() : null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<RatesDto>('/api/rates', { timeout: 15000 });
      setData(res.data);
      setLastFetched(new Date());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initial) void refresh();
    const start = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        if (document.visibilityState === 'visible') void refresh();
      }, refreshMs);
    };
    start();
    const onVisible = () => {
      if (document.visibilityState === 'visible' && lastFetched && Date.now() - lastFetched.getTime() > refreshMs) void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs]);

  return { data, loading, error, refresh, lastFetched };
}

export function useRateHistory(currency: string, days: number, serviceSlug?: string | null) {
  const [points, setPoints] = useState<RateHistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get<{ points: RateHistoryPoint[] }>('/api/rates/history', {
        params: { from: currency, days, ...(serviceSlug ? { service: serviceSlug } : {}) },
        timeout: 15000,
      })
      .then((res) => {
        if (!cancelled) {
          setPoints(res.data.points);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currency, days, serviceSlug]);

  return { points, loading, error };
}
