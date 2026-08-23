'use client';

import { useState, useEffect } from 'react';
import { Album, ALBUMS as MOCK_ALBUMS } from '@/data/mockData';

interface ApiAlbum {
  id: string;
  title: string;
  image_url: string;
  release_date: string | null;
  description: string | null;
  track_count: number;
  total_duration: number;
}

function mapApiAlbum(a: ApiAlbum): Album {
  return {
    id: a.id,
    title: a.title,
    image: a.image_url || '',
    releaseDate: a.release_date ?? new Date().toISOString(),
    description: a.description ?? undefined,
    trackCount: Number(a.track_count ?? 0),
    duration: Number(a.total_duration ?? 0),
    songIds: [],
  };
}

export function useLiveAlbums() {
  const [albums, setAlbums] = useState<Album[]>(MOCK_ALBUMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/albums')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ albums: apiAlbums }: { albums: ApiAlbum[] }) => {
        if (!apiAlbums?.length) return;
        const mapped = apiAlbums.map(mapApiAlbum);
        const dbIds = new Set(mapped.map(a => a.id));
        const mockOnly = MOCK_ALBUMS.filter(a => !dbIds.has(a.id));
        setAlbums([...mapped, ...mockOnly]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { albums, loading };
}
