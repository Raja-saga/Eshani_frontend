'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import useLibraryStore, { LocalPlaylist } from '@/store/libraryStore';

/** Fetches the signed-in user's playlists from D1 and keeps libraryStore in sync. */
export function useUserPlaylists() {
  const { userId, isLoaded } = useAuth();
  const setPlaylists = useLibraryStore((s) => s.setPlaylists);
  const localPlaylists = useLibraryStore((s) => s.localPlaylists);
  const loadedForUser = useRef<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    if (!userId) {
      setPlaylists([]);
      loadedForUser.current = null;
      return;
    }
    try {
      const res = await fetch('/api/user/playlists');
      if (!res.ok) return;
      const { playlists } = await res.json() as { playlists: LocalPlaylist[] };
      setPlaylists(playlists);
      loadedForUser.current = userId;
    } catch {
      // silently ignore network errors
    }
  }, [userId, setPlaylists]);

  useEffect(() => {
    if (!isLoaded) return;
    // Re-fetch whenever the signed-in user changes
    if (loadedForUser.current !== (userId ?? null)) {
      fetchPlaylists();
    }
  }, [isLoaded, userId, fetchPlaylists]);

  const createPlaylist = useCallback(async (name: string, description = '') => {
    const res = await fetch('/api/user/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to create playlist');
    const { playlist } = await res.json() as { playlist: LocalPlaylist };
    setPlaylists([playlist, ...localPlaylists]);
    return playlist;
  }, [localPlaylists, setPlaylists]);

  const deletePlaylist = useCallback(async (id: string) => {
    await fetch(`/api/user/playlists/${id}`, { method: 'DELETE' });
    setPlaylists(localPlaylists.filter((p) => p.id !== id));
  }, [localPlaylists, setPlaylists]);

  const renamePlaylist = useCallback(async (id: string, name: string) => {
    await fetch(`/api/user/playlists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setPlaylists(localPlaylists.map((p) => p.id === id ? { ...p, name } : p));
  }, [localPlaylists, setPlaylists]);

  const addSongToPlaylist = useCallback(async (playlistId: string, songId: string) => {
    await fetch(`/api/user/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    setPlaylists(localPlaylists.map((p) =>
      p.id === playlistId && !p.songIds.includes(songId)
        ? { ...p, songIds: [...p.songIds, songId] }
        : p
    ));
  }, [localPlaylists, setPlaylists]);

  const removeSongFromPlaylist = useCallback(async (playlistId: string, songId: string) => {
    await fetch(`/api/user/playlists/${playlistId}/songs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    setPlaylists(localPlaylists.map((p) =>
      p.id === playlistId
        ? { ...p, songIds: p.songIds.filter((s) => s !== songId) }
        : p
    ));
  }, [localPlaylists, setPlaylists]);

  return {
    playlists: localPlaylists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    refetch: fetchPlaylists,
  };
}
