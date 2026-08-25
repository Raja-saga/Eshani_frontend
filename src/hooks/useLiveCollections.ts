'use client';

import { useState, useEffect } from 'react';

export interface Collection {
  id: string;
  name: string;
  description: string;
  image_url: string;
  song_count: number;
}

export function useLiveCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collections')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ collections: data }: { collections: Collection[] }) => {
        if (data?.length) setCollections(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { collections, loading };
}
