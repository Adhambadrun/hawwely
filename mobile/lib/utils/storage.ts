import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'hawwely:';

export interface CachedValue<T> {
  value: T;
  savedAt: number;
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  try {
    const payload: CachedValue<T> = { value, savedAt: Date.now() };
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    /* storage full / unavailable — caching is best-effort */
  }
}

export async function cacheGet<T>(key: string, maxAgeMs?: number): Promise<CachedValue<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedValue<T>;
    if (maxAgeMs != null && Date.now() - parsed.savedAt > maxAgeMs) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function cacheClear(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX) && !k.startsWith(PREFIX + 'store')));
}
