import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PayoutMethod, SendCurrency } from '@/lib/shared/types';
import type { AppLanguage } from '@/i18n';

export interface RecentComparison {
  currency: SendCurrency;
  amount: number;
  bestService: string;
  bestServiceAr: string;
  received: number;
  savings: number;
  at: number;
}

export interface LocalAlert {
  id: string;
  corridor_id: string;
  currency: SendCurrency;
  target_rate: number;
  direction: 'above' | 'below';
  notify_via: ('push' | 'email' | 'whatsapp')[];
  is_active: boolean;
  created_at: string;
  triggered_at: string | null;
  triggered_rate?: number | null;
}

interface StoreState {
  hydrated: boolean;
  onboarded: boolean;
  language: AppLanguage | null;
  currency: SendCurrency;
  amount: number;
  payout: PayoutMethod | null;
  hapticsEnabled: boolean;
  offlineCacheEnabled: boolean;
  notifPrefs: { rateAlerts: boolean; weeklyDigest: boolean; promos: boolean };
  pushToken: string | null;
  sessionId: string;
  recent: RecentComparison[];
  localAlerts: LocalAlert[];
  totalSaved: number;
  reputation: number;

  setHydrated: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setLanguage: (l: AppLanguage) => void;
  setCurrency: (c: SendCurrency) => void;
  setAmount: (a: number) => void;
  setPayout: (p: PayoutMethod | null) => void;
  setHaptics: (v: boolean) => void;
  setOfflineCache: (v: boolean) => void;
  setNotifPref: (k: keyof StoreState['notifPrefs'], v: boolean) => void;
  setPushToken: (t: string | null) => void;
  pushRecent: (r: RecentComparison) => void;
  addLocalAlert: (a: LocalAlert) => void;
  removeLocalAlert: (id: string) => void;
  markLocalAlertTriggered: (id: string, rate: number) => void;
  addSavings: (egp: number) => void;
  addReputation: (points: number) => void;
  reset: () => void;
}

function makeSessionId() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const initial = {
  hydrated: false,
  onboarded: false,
  language: null as AppLanguage | null,
  currency: 'SAR' as SendCurrency,
  amount: 2000,
  payout: null as PayoutMethod | null,
  hapticsEnabled: true,
  offlineCacheEnabled: true,
  notifPrefs: { rateAlerts: true, weeklyDigest: false, promos: false },
  pushToken: null as string | null,
  sessionId: makeSessionId(),
  recent: [] as RecentComparison[],
  localAlerts: [] as LocalAlert[],
  totalSaved: 0,
  reputation: 0,
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...initial,
      setHydrated: (hydrated) => set({ hydrated }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setAmount: (amount) => set({ amount }),
      setPayout: (payout) => set({ payout }),
      setHaptics: (hapticsEnabled) => set({ hapticsEnabled }),
      setOfflineCache: (offlineCacheEnabled) => set({ offlineCacheEnabled }),
      setNotifPref: (k, v) => set((s) => ({ notifPrefs: { ...s.notifPrefs, [k]: v } })),
      setPushToken: (pushToken) => set({ pushToken }),
      pushRecent: (r) =>
        set((s) => ({
          recent: [r, ...s.recent.filter((x) => !(x.currency === r.currency && x.amount === r.amount))].slice(0, 5),
        })),
      addLocalAlert: (a) => set((s) => ({ localAlerts: [a, ...s.localAlerts] })),
      removeLocalAlert: (id) => set((s) => ({ localAlerts: s.localAlerts.filter((a) => a.id !== id) })),
      markLocalAlertTriggered: (id, rate) =>
        set((s) => ({ localAlerts: s.localAlerts.map((a) => (a.id === id ? { ...a, is_active: false, triggered_at: new Date().toISOString(), triggered_rate: rate } : a)) })),
      addSavings: (egp) => set((s) => ({ totalSaved: Math.round(s.totalSaved + Math.max(0, egp)) })),
      addReputation: (points) => set((s) => ({ reputation: s.reputation + points })),
      reset: () => set({ ...initial, sessionId: makeSessionId(), hydrated: true }),
    }),
    {
      name: 'hawwely:store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        language: s.language,
        currency: s.currency,
        amount: s.amount,
        payout: s.payout,
        hapticsEnabled: s.hapticsEnabled,
        offlineCacheEnabled: s.offlineCacheEnabled,
        notifPrefs: s.notifPrefs,
        pushToken: s.pushToken,
        sessionId: s.sessionId,
        recent: s.recent,
        localAlerts: s.localAlerts,
        totalSaved: s.totalSaved,
        reputation: s.reputation,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
