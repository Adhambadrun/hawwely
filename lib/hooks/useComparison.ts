'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios, { type AxiosError } from 'axios';
import type { ComparisonResponse, PayoutMethod, SendCurrency } from '@/lib/types';
import { useStore } from '@/store/useStore';

interface UseComparisonOptions {
  /** Run automatically on mount / when inputs change */
  auto?: boolean;
  initialData?: ComparisonResponse | null;
}

export interface ComparisonQuery {
  from: SendCurrency;
  amount: number;
  payout?: PayoutMethod | null;
}

/**
 * Fetches /api/rates/compare and keeps the last successful payload in the
 * Zustand store (persisted) so returning users see instant results even offline.
 */
export function useComparison(query: ComparisonQuery, { auto = true, initialData = null }: UseComparisonOptions = {}) {
  const setLastComparison = useStore((s) => s.setLastComparison);
  const [data, setData] = useState<ComparisonResponse | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastKey = useRef<string>(initialData ? `${initialData.query.from}:${initialData.query.amount}:any` : '');

  const run = useCallback(
    async (q: ComparisonQuery = query, force = false) => {
      const key = `${q.from}:${q.amount}:${q.payout ?? 'any'}`;
      if (!force && key === lastKey.current && data) return data;
      if (!q.amount || q.amount <= 0) return null;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get<ComparisonResponse>('/api/rates/compare', {
          params: { from: q.from, to: 'EGP', amount: q.amount, ...(q.payout ? { payout: q.payout } : {}) },
          signal: controller.signal,
          timeout: 15000,
        });
        lastKey.current = key;
        setData(res.data);
        setLastComparison(res.data);
        return res.data;
      } catch (err) {
        if (axios.isCancel(err)) return null;
        const e = err as AxiosError<{ error?: string }>;
        setError(e.response?.data?.error ?? e.message ?? 'error');
        return null;
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.from, query.amount, query.payout, data, setLastComparison],
  );

  useEffect(() => {
    if (!auto) return;
    void run(query);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, query.from, query.amount, query.payout]);

  return { data, loading, error, run, refetch: () => run(query, true) };
}
