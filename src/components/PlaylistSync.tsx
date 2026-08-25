'use client';

import { useUserPlaylists } from '@/hooks/useUserPlaylists';

/** Mounts in the root layout to keep libraryStore.localPlaylists synced with the DB. */
export default function PlaylistSync() {
  useUserPlaylists();
  return null;
}
