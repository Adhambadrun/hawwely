import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  setData: (d: T) => void;
}

/** Tiny SWR-style hook: runs `loader` on mount and whenever `deps` change; supports pull-to-refresh. */
export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const seq = useRef(0);

  const run = useCallback(
    async (mode: 'load' | 'refresh') => {
      const id = ++seq.current;
      if (mode === 'load') setLoading(true);
      else setRefreshing(true);
      try {
        const result = await loader();
        if (id === seq.current) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (id === seq.current) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (id === seq.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    void run('load');
  }, [run]);

  return { data, error, loading, refreshing, refresh: () => run('refresh'), setData };
}
