'use client';

import { useState, useEffect } from 'react';
import { Track, ALL_SONGS as MOCK_SONGS } from '@/data/mockData';

interface ApiSong {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  audio_url: string;
  image_url: string;
  duration: number;
  plays: number;
  genre: string | null;
  is_premium: number;
  release_date: string | null;
  youtube_id: string | null;
}

function mapApiSong(s: ApiSong): Track {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album ?? undefined,
    image:
      s.image_url ||
      (s.youtube_id
        ? `https://img.youtube.com/vi/${s.youtube_id}/hqdefault.jpg`
        : ''),
    audioUrl: s.audio_url,
    duration: s.duration,
    plays: s.plays,
    genre: s.genre ?? undefined,
    isPremium: s.is_premium === 1,
    youtubeId: s.youtube_id ?? undefined,
    releaseDate: s.release_date ?? undefined,
  };
}

interface LiveCatalog {
  /** All songs: API songs (newest first) merged with mockData fallback */
  songs: Track[];
  /** Songs sorted newest release_date first */
  recentSongs: Track[];
  /** Songs sorted most-played first */
  popularSongs: Track[];
  /** DB-only uploads (not present in mockData) */
  newUploads: Track[];
  loading: boolean;
}

export function useLiveCatalog(): LiveCatalog {
  const [songs, setSongs] = useState<Track[]>(MOCK_SONGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/songs?limit=200')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ songs: apiSongs }: { songs: ApiSong[] }) => {
        if (!apiSongs?.length) return;
        // DB has songs — show only DB songs, no mock YouTube fallback
        setSongs(apiSongs.map(mapApiSong));
      })
      .catch(() => {
        /* keep mockData as fallback */
      })
      .finally(() => setLoading(false));
  }, []);

  const recentSongs = [...songs].sort((a, b) => {
    const da = a.releaseDate ?? '';
    const db = b.releaseDate ?? '';
    return db.localeCompare(da) || (b.plays ?? 0) - (a.plays ?? 0);
  });

  const popularSongs = [...songs].sort(
    (a, b) => (b.plays ?? 0) - (a.plays ?? 0)
  );

  const mockIds = new Set(MOCK_SONGS.map((s) => s.id));
  const newUploads = songs.filter((s) => !mockIds.has(s.id));

  return { songs, recentSongs, popularSongs, newUploads, loading };
}
