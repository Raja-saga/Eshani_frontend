/**
 * Player Store (Zustand)
 * 
 * This file contains the Zustand store for managing the audio player state.
 * It handles track playback, queue management, and player controls.
 */

import { create } from 'zustand';
import { Track, PlayerState } from '@/types';
import { DEFAULT_VOLUME } from '@/constants';

interface PlayerStore extends PlayerState {
  // Actions
  setCurrentTrack: (track: Track | null) => void;
  togglePlayPause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  setCurrentIndex: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setRepeat: (repeat: 'off' | 'all' | 'one') => void;
  toggleShuffle: () => void;
  setVolume: (volume: number) => void;
  clearQueue: () => void;
  playTrack: (track: Track) => void;
  addNextInQueue: (track: Track) => void;
}

const usePlayerStore = create<PlayerStore>((set) => ({
  // Initial State
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  queue: [],
  currentIndex: 0,
  repeat: 'off',
  shuffle: false,
  volume: DEFAULT_VOLUME,

  // Actions
  setCurrentTrack: (track) => set({ currentTrack: track }),

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setQueue: (queue) => set({ queue, currentIndex: 0 }),

  addToQueue: (track) =>
    set((state) => ({
      queue: [...state.queue, track],
    })),

  removeFromQueue: (trackId) =>
    set((state) => {
      const newQueue = state.queue.filter((track) => track.id !== trackId);
      return { queue: newQueue };
    }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  nextTrack: () =>
    set((state) => {
      const { queue, currentIndex, repeat } = state;
      let nextIndex = currentIndex + 1;

      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return { currentIndex: queue.length - 1 };
        }
      }

      return {
        currentIndex: nextIndex,
        currentTrack: queue[nextIndex],
        currentTime: 0,
      };
    }),

  previousTrack: () =>
    set((state) => {
      const { queue, currentIndex } = state;
      const prevIndex = Math.max(0, currentIndex - 1);

      return {
        currentIndex: prevIndex,
        currentTrack: queue[prevIndex],
        currentTime: 0,
      };
    }),

  setRepeat: (repeat) => set({ repeat }),

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

  clearQueue: () =>
    set({
      queue: [],
      currentIndex: 0,
      currentTrack: null,
      isPlaying: false,
    }),

  playTrack: (track) =>
    set((state) => ({
      currentTrack: track,
      queue: [track, ...state.queue.filter((t) => t.id !== track.id)],
      currentIndex: 0,
      isPlaying: true,
      currentTime: 0,
    })),

  addNextInQueue: (track) =>
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(state.currentIndex + 1, 0, track);
      return { queue: newQueue };
    }),
}));

export default usePlayerStore;
