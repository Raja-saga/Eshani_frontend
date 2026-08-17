import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalPlaylist {
  id: string;
  name: string;
  description: string;
  songIds: string[];
  createdAt: string;
}

interface LibraryStore {
  likedSongIds: string[];
  savedAlbumIds: string[];
  notifiedReleaseIds: string[];
  localPlaylists: LocalPlaylist[];
  recentlyPlayedIds: string[];
  toggleLike: (id: string) => void;
  isLiked: (id: string) => boolean;
  toggleSaveAlbum: (id: string) => void;
  isAlbumSaved: (id: string) => boolean;
  toggleNotify: (id: string) => void;
  isNotified: (id: string) => boolean;
  createPlaylist: (name: string, description?: string) => void;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  addToRecentlyPlayed: (id: string) => void;
}

const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      likedSongIds: [],
      savedAlbumIds: [],
      notifiedReleaseIds: [],
      localPlaylists: [],
      recentlyPlayedIds: [],

      toggleLike: (id) =>
        set((state) => ({
          likedSongIds: state.likedSongIds.includes(id)
            ? state.likedSongIds.filter((s) => s !== id)
            : [...state.likedSongIds, id],
        })),

      isLiked: (id) => get().likedSongIds.includes(id),

      toggleSaveAlbum: (id) =>
        set((state) => ({
          savedAlbumIds: state.savedAlbumIds.includes(id)
            ? state.savedAlbumIds.filter((s) => s !== id)
            : [...state.savedAlbumIds, id],
        })),

      isAlbumSaved: (id) => get().savedAlbumIds.includes(id),

      toggleNotify: (id) =>
        set((state) => ({
          notifiedReleaseIds: state.notifiedReleaseIds.includes(id)
            ? state.notifiedReleaseIds.filter((s) => s !== id)
            : [...state.notifiedReleaseIds, id],
        })),

      isNotified: (id) => get().notifiedReleaseIds.includes(id),

      createPlaylist: (name, description = '') =>
        set((state) => ({
          localPlaylists: [
            {
              id: `lp-${Date.now()}`,
              name,
              description,
              songIds: [],
              createdAt: new Date().toISOString(),
            },
            ...state.localPlaylists,
          ],
        })),

      deletePlaylist: (id) =>
        set((state) => ({
          localPlaylists: state.localPlaylists.filter((p) => p.id !== id),
        })),

      renamePlaylist: (id, name) =>
        set((state) => ({
          localPlaylists: state.localPlaylists.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        })),

      addSongToPlaylist: (playlistId, songId) =>
        set((state) => ({
          localPlaylists: state.localPlaylists.map((p) =>
            p.id === playlistId && !p.songIds.includes(songId)
              ? { ...p, songIds: [...p.songIds, songId] }
              : p
          ),
        })),

      removeSongFromPlaylist: (playlistId, songId) =>
        set((state) => ({
          localPlaylists: state.localPlaylists.map((p) =>
            p.id === playlistId
              ? { ...p, songIds: p.songIds.filter((s) => s !== songId) }
              : p
          ),
        })),

      addToRecentlyPlayed: (id) =>
        set((state) => {
          const filtered = state.recentlyPlayedIds.filter((s) => s !== id);
          return { recentlyPlayedIds: [id, ...filtered].slice(0, 30) };
        }),
    }),
    { name: 'eshani-library' }
  )
);

export default useLibraryStore;
