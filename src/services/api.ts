/**
 * ESHANI API Service — calls the Next.js API routes (/api/*).
 * All routes are relative so they work in development and production.
 */

import type { Track } from '@/data/mockData';

// ── Shared fetch helper ───────────────────────────────────────────────────────
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Songs ─────────────────────────────────────────────────────────────────────
export const songAPI = {
  getAll: (params?: { genre?: string; limit?: number; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.genre)    qs.set('genre',    params.genre);
    if (params?.limit)    qs.set('limit',    String(params.limit));
    if (params?.featured) qs.set('featured', 'true');
    return apiFetch<{ songs: Track[] }>(`/api/songs?${qs}`).then((d) => d.songs);
  },

  getById: (id: string) =>
    apiFetch<{ song: Track }>(`/api/songs/${id}`).then((d) => d.song),

  /** Call when a song starts playing — increments the global play count */
  recordPlay: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/songs/${id}`, { method: 'POST' }),
};

// ── Playlists ─────────────────────────────────────────────────────────────────
export const playlistAPI = {
  getAll: () =>
    apiFetch<{ playlists: unknown[] }>('/api/playlists').then((d) => d.playlists),

  getById: (id: string) =>
    apiFetch<{ playlist: unknown; songs: Track[] }>(`/api/playlists/${id}`),
};

// ── Albums ────────────────────────────────────────────────────────────────────
export const albumAPI = {
  getAll: () =>
    apiFetch<{ albums: unknown[] }>('/api/albums').then((d) => d.albums),

  getById: (id: string) =>
    apiFetch<{ album: unknown; songs: Track[] }>(`/api/albums/${id}`),
};

// ── Library (auth required) ───────────────────────────────────────────────────
export const libraryAPI = {
  get: () =>
    apiFetch<{ likedSongs: Track[]; recentlyPlayed: Track[] }>('/api/library'),

  like: (songId: string) =>
    apiFetch<{ liked: boolean; songId: string }>('/api/library/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    }),

  unlike: (songId: string) =>
    apiFetch<{ liked: boolean; songId: string }>('/api/library/like', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    }),

  checkLike: (songId: string) =>
    apiFetch<{ liked: boolean; songId: string }>(`/api/library/like?songId=${songId}`),

  recordHistory: (songId: string) =>
    apiFetch<{ success: boolean }>('/api/library/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    }),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (q: string) =>
    apiFetch<{ songs: Track[]; query: string }>(`/api/search?q=${encodeURIComponent(q)}`),
};
