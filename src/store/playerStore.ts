import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, PlayerState } from '@/types';
import { DEFAULT_VOLUME } from '@/constants';

interface PlayerStore extends PlayerState {
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

const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      queue: [],
      currentIndex: 0,
      repeat: 'off',
      shuffle: false,
      volume: DEFAULT_VOLUME,

      setCurrentTrack: (track) => set({ currentTrack: track }),

      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setCurrentTime: (time) => set({ currentTime: time }),

      setQueue: (queue) => set({ queue, currentIndex: 0 }),

      addToQueue: (track) =>
        set((state) => ({ queue: [...state.queue, track] })),

      removeFromQueue: (trackId) =>
        set((state) => ({
          queue: state.queue.filter((track) => track.id !== trackId),
        })),

      setCurrentIndex: (index) => set({ currentIndex: index }),

      nextTrack: () =>
        set((state) => {
          const { queue, currentIndex, repeat } = state;
          let nextIndex = currentIndex + 1;
          if (nextIndex >= queue.length) {
            if (repeat === 'all') {
              nextIndex = 0;
            } else {
              return {};
            }
          }
          return {
            currentIndex: nextIndex,
            currentTrack: queue[nextIndex],
            currentTime: 0,
            isPlaying: true,
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
            isPlaying: true,
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
          currentTime: 0,
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
    }),
    {
      name: 'eshani-player',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        currentIndex: state.currentIndex,
        volume: state.volume,
        repeat: state.repeat,
        shuffle: state.shuffle,
      }),
      // Always start paused after a page reload
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isPlaying = false;
          state.currentTime = 0;
        }
      },
    }
  )
);

export default usePlayerStore;
