/**
 * Tiny in-memory TTL cache for server runtime.
 *
 * Next.js already caches `fetch()` and ISR pages; this covers computed values
 * (comparison payloads, mid-market snapshots) inside a single server instance
 * so bursts of traffic do not recompute the same thing. Safe on serverless:
 * a cold start simply begins with an empty cache.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): T {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await loader();
  return cacheSet(key, value, ttlMs);
}

export function cacheDelete(prefix: string): void {
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export const TTL = {
  rates: 5 * 60 * 1000,
  comparison: 60 * 1000,
  history: 10 * 60 * 1000,
  catalog: 30 * 60 * 1000,
} as const;
