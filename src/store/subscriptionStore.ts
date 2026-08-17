import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SubscriptionStore {
  isPremium: boolean;
  /** For demo/testing only — activates premium without payment */
  previewPremium: () => void;
  deactivate: () => void;
}

const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      isPremium: false,
      previewPremium: () => set({ isPremium: true }),
      deactivate: () => set({ isPremium: false }),
    }),
    { name: 'eshani-subscription' }
  )
);

export default useSubscriptionStore;
