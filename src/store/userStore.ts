/**
 * User Store (Zustand)
 * 
 * This file contains the Zustand store for managing user authentication
 * and profile state throughout the application.
 */

import { create } from 'zustand';
import { User } from '@/types';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  addLikedTrack: (trackId: string) => void;
  removeLikedTrack: (trackId: string) => void;
}

const useUserStore = create<UserStore>((set) => ({
  // Initial State
  user: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  logout: () => set({ user: null, error: null }),

  updateUserProfile: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  addLikedTrack: (trackId) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            likedTracks: [...new Set([...state.user.likedTracks, trackId])],
          }
        : null,
    })),

  removeLikedTrack: (trackId) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            likedTracks: state.user.likedTracks.filter((id) => id !== trackId),
          }
        : null,
    })),
}));

export default useUserStore;
