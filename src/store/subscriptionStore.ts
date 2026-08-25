import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubscriptionInfo {
  id: string;
  plan: string;
  amount: number;
  started_at: string;
  expires_at: string | null;
}

interface SubscriptionStore {
  isPremium: boolean;
  subscription: SubscriptionInfo | null;
  setSubscription: (sub: SubscriptionInfo | null) => void;
  activate: (sub: SubscriptionInfo) => void;
  deactivate: () => void;
}

const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      isPremium: false,
      subscription: null,

      setSubscription: (sub) =>
        set({ subscription: sub, isPremium: sub !== null }),

      activate: (sub) =>
        set({ subscription: sub, isPremium: true }),

      deactivate: () =>
        set({ subscription: null, isPremium: false }),
    }),
    {
      name: 'eshani-subscription',
      partialize: (s) => ({ isPremium: s.isPremium, subscription: s.subscription }),
    }
  )
);

export default useSubscriptionStore;
