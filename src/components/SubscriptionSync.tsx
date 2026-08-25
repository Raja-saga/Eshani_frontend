'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSubscriptionStore from '@/store/subscriptionStore';
import usePlayerStore from '@/store/playerStore';

const CHECK_INTERVAL_MS = 60 * 1000; // every 60 seconds like Spotify

export default function SubscriptionSync() {
  const { userId, isLoaded } = useAuth();
  const { setSubscription, deactivate, isPremium } = useSubscriptionStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cutPremiumPlayback = useCallback(() => {
    // If a premium track is currently playing, pause it immediately
    const { currentTrack, isPlaying, setIsPlaying, clearQueue } = usePlayerStore.getState();
    if (isPlaying && currentTrack?.isPremium) {
      setIsPlaying(false);
      clearQueue();
    }
  }, []);

  const syncStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/subscription/status');
      const { subscription, expired } = await r.json();
      if (expired || !subscription) {
        // Was premium before — cut playback and downgrade immediately
        if (useSubscriptionStore.getState().isPremium) {
          cutPremiumPlayback();
        }
        deactivate();
      } else {
        setSubscription(subscription);
      }
    } catch {
      // network error — keep current state
    }
  }, [deactivate, setSubscription, cutPremiumPlayback]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isLoaded) return;

    if (!userId) {
      if (isPremium) cutPremiumPlayback();
      deactivate();
      return;
    }

    // Always sync immediately on mount or user change
    syncStatus();

    // Poll every 60s while tab is open
    intervalRef.current = setInterval(syncStatus, CHECK_INTERVAL_MS);

    // Re-sync the moment user switches back to this tab
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncStatus();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isLoaded, userId, syncStatus, deactivate, isPremium, cutPremiumPlayback]);

  return null;
}
