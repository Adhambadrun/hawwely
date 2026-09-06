'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ComparisonResponse, PayoutMethod, SendCurrency } from '@/lib/types';
import { DEFAULT_AMOUNT, DEFAULT_SEND_CURRENCY } from '@/lib/utils/constants';

interface HawwelyState {
  /** Selected send currency (corridor) */
  currency: SendCurrency;
  /** Amount in send currency */
  amount: number;
  /** Optional payout filter */
  payout: PayoutMethod | null;
  /** Sort preference for results */
  sort: 'cheapest' | 'fastest' | 'rating';
  /** Last comparison results (cached for offline / instant back-nav) */
  lastComparison: ComparisonResponse | null;
  /** Favourite corridors on the live rates page */
  favourites: SendCurrency[];
  /** Toasts */
  toasts: Toast[];
  hasHydrated: boolean;

  setCurrency: (currency: SendCurrency) => void;
  setAmount: (amount: number) => void;
  setPayout: (payout: PayoutMethod | null) => void;
  setSort: (sort: HawwelyState['sort']) => void;
  setLastComparison: (c: ComparisonResponse | null) => void;
  toggleFavourite: (currency: SendCurrency) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  setHasHydrated: (v: boolean) => void;
}

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
  durationMs?: number;
}

let toastSeq = 1;

export const useStore = create<HawwelyState>()(
  persist(
    (set, get) => ({
      currency: DEFAULT_SEND_CURRENCY,
      amount: DEFAULT_AMOUNT,
      payout: null,
      sort: 'cheapest',
      lastComparison: null,
      favourites: ['SAR', 'AED', 'USD'],
      toasts: [],
      hasHydrated: false,

      setCurrency: (currency) => set({ currency }),
      setAmount: (amount) => set({ amount }),
      setPayout: (payout) => set({ payout }),
      setSort: (sort) => set({ sort }),
      setLastComparison: (lastComparison) => set({ lastComparison }),
      toggleFavourite: (currency) => {
        const favs = get().favourites;
        set({ favourites: favs.includes(currency) ? favs.filter((c) => c !== currency) : [...favs, currency] });
      },
      pushToast: (toast) => {
        const id = toastSeq++;
        set({ toasts: [...get().toasts, { id, durationMs: 4000, variant: 'info', ...toast }] });
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'hawwely-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        currency: s.currency,
        amount: s.amount,
        payout: s.payout,
        sort: s.sort,
        lastComparison: s.lastComparison,
        favourites: s.favourites,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
