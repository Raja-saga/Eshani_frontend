'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SongRow, Footer } from '@/components';
import {
  FEATURED_SONGS,
  TOP_PICKS,
  ALL_SONGS as MOCK_SONGS,
  Track,
} from '@/data/mockData';
import useLibraryStore from '@/store/libraryStore';
import { Search, X, Plus, Check, ChevronLeft } from 'lucide-react';

// Shape returned by /api/songs
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
    image: s.image_url || (s.youtube_id ? `https://img.youtube.com/vi/${s.youtube_id}/hqdefault.jpg` : ''),
    audioUrl: s.audio_url,
    duration: s.duration,
    plays: s.plays,
    genre: s.genre ?? undefined,
    isPremium: s.is_premium === 1,
    youtubeId: s.youtube_id ?? undefined,
    releaseDate: s.release_date ?? undefined,
  };
}

function mergeWithMock(apiSongs: Track[]): Track[] {
  // API songs first (newest uploads), then mockData songs not already covered by the API
  const apiIds = new Set(apiSongs.map((s) => s.id));
  const mockOnly = MOCK_SONGS.filter((s) => !apiIds.has(s.id));
  return [...apiSongs, ...mockOnly];
}

type SectionKey = 'all' | 'popular' | 'recent' | 'featured' | 'top-picks';

const SECTION_TABS: { key: SectionKey; label: string }[] = [
  { key: 'all',       label: 'All Songs'  },
  { key: 'popular',   label: 'Popular'    },
  { key: 'recent',    label: 'Recent'     },
  { key: 'featured',  label: 'Featured'   },
  { key: 'top-picks', label: 'Top Picks'  },
];

function SongsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addTo          = searchParams.get('addTo') ?? '';
  const initialSection = (searchParams.get('section') as SectionKey) ?? 'all';
  const initialQ       = searchParams.get('q') ?? '';

  const [section, setSection] = useState<SectionKey>(initialSection);
  const [query,   setQuery]   = useState(initialQ);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [allSongs, setAllSongs] = useState<Track[]>(MOCK_SONGS);
  const [loading,  setLoading] = useState(true);

  const { toggleLike, isLiked, addSongToPlaylist, localPlaylists } = useLibraryStore();
  const playlist = localPlaylists.find((p) => p.id === addTo);

  // Fetch live songs from DB, newest first
  useEffect(() => {
    fetch('/api/songs?limit=100')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(({ songs }: { songs: ApiSong[] }) => {
        if (songs?.length) {
          const mapped = songs.map(mapApiSong);
          setAllSongs(mergeWithMock(mapped));
        }
      })
      .catch(() => { /* keep mockData fallback */ })
      .finally(() => setLoading(false));
  }, []);

  // Build section lists from live data
  const SECTION_MAP = useMemo<Record<SectionKey, Track[]>>(() => {
    const mockFeaturedIds = new Set(FEATURED_SONGS.map((s) => s.id));
    const mockTopPickIds  = new Set(TOP_PICKS.map((s) => s.id));

    // For curated sections: keep original curation but prepend new DB-only songs
    const dbOnly = allSongs.filter(
      (s) => !MOCK_SONGS.some((m) => m.id === s.id)
    );

    return {
      all:        [...allSongs].sort((a, b) => {
        // Newest release_date first; fall back to plays
        const da = a.releaseDate ?? '';
        const db = b.releaseDate ?? '';
        return da !== db ? db.localeCompare(da) : (b.plays ?? 0) - (a.plays ?? 0);
      }),
      popular:    [...allSongs].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0)),
      recent:     [...allSongs].sort((a, b) => {
        const da = a.releaseDate ?? '';
        const db = b.releaseDate ?? '';
        return db.localeCompare(da) || (b.plays ?? 0) - (a.plays ?? 0);
      }),
      featured:   [...dbOnly, ...allSongs.filter((s) => mockFeaturedIds.has(s.id))],
      'top-picks':  [...dbOnly, ...allSongs.filter((s) => mockTopPickIds.has(s.id))],
    };
  }, [allSongs]);

  const SECTION_SUBTITLES: Record<SectionKey, string> = {
    all:         `${allSongs.length} tracks — the complete ESHANI catalog`,
    popular:     'Sorted by most streams',
    recent:      'Newest releases first',
    featured:    'Hand-picked highlights',
    'top-picks': 'Top picks for you',
  };

  const tracks = useMemo(() => {
    const base = SECTION_MAP[section] ?? allSongs;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.genre?.toLowerCase().includes(q) ||
        t.album?.toLowerCase().includes(q)
    );
  }, [section, query, SECTION_MAP, allSongs]);

  const handleAddToPlaylist = (songId: string) => {
    if (!addTo) return;
    addSongToPlaylist(addTo, songId);
    setAddedIds((prev) => new Set(prev).add(songId));
  };

  const isAddMode = !!addTo && !!playlist;

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Header */}
      <div className="container-premium pt-28 pb-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {isAddMode && (
            <Link
              href={`/playlists/${addTo}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-sm font-semibold text-white hover:bg-[rgba(255,255,255,0.12)] transition-all mb-6"
            >
              <ChevronLeft className="w-4 h-4 text-[#D40000]" />
              Back to {playlist.name}
            </Link>
          )}

          <div className="h-0.5 w-10 bg-[#D40000] rounded-full mb-3" />
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-2" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
            {isAddMode ? 'Add Songs' : 'Songs'}
          </h1>
          <p className="text-[#9CA3AF] text-base">
            {isAddMode ? `Choose songs to add to "${playlist.name}"` : SECTION_SUBTITLES[section]}
          </p>

          <AnimatePresence>
            {isAddMode && addedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[rgba(212,0,0,0.1)] border border-[rgba(212,0,0,0.25)]"
              >
                <Check className="w-4 h-4 text-[#D40000] flex-shrink-0" />
                <p className="text-sm text-white font-medium">
                  {addedIds.size} song{addedIds.size !== 1 ? 's' : ''} added to &ldquo;{playlist.name}&rdquo;
                </p>
                <Link href={`/playlists/${addTo}`} className="ml-auto text-xs font-semibold text-[#D40000] hover:underline flex-shrink-0">
                  View Playlist →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search + Filter row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="   Search songs, genres, albums..."
              className="w-full h-12 pl-11 pr-10 rounded-2xl text-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none transition-all"
              aria-label="Search songs"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#9CA3AF] hover:text-white" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isAddMode && (
            <div className="flex items-center gap-1 flex-wrap">
              {SECTION_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSection(tab.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    section === tab.key
                      ? 'bg-[#D40000] text-white'
                      : 'bg-[rgba(255,255,255,0.06)] text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.08)]'
                  }`}
                  aria-pressed={section === tab.key}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Songs List */}
      <section className="container-premium pb-8">
        {loading ? (
          <div className="flex flex-col gap-2 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl">
                <div className="w-8 h-4 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
                <div className="w-11 h-11 bg-[rgba(255,255,255,0.05)] rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded animate-pulse w-1/3" />
                  <div className="h-2.5 bg-[rgba(255,255,255,0.03)] rounded animate-pulse w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 gap-4">
            <Search className="w-12 h-12 text-[#9CA3AF]" />
            <p className="text-[#9CA3AF] text-lg">No songs match your search</p>
            <button onClick={() => setQuery('')} className="text-sm text-[#D40000] hover:underline">Clear search</button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <p className="text-xs text-[#9CA3AF] mb-4 ml-4">
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}{query && ` for "${query}"`}
            </p>

            {isAddMode ? (
              <div className="space-y-1">
                {tracks.map((t) => {
                  const alreadyInPlaylist = playlist.songIds.includes(t.id);
                  const justAdded = addedIds.has(t.id);
                  const added = alreadyInPlaylist || justAdded;
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors group">
                      <div className="relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden bg-[#181818]">
                        <Image src={t.image} alt={t.title} fill className="object-cover" sizes="44px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{t.title}</p>
                        <p className="text-xs text-[#9CA3AF] truncate">{t.artist}</p>
                      </div>
                      {t.genre && (
                        <span className="hidden md:block text-xs text-[#9CA3AF] px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex-shrink-0">
                          {t.genre}
                        </span>
                      )}
                      <motion.button
                        whileHover={{ scale: added ? 1 : 1.08 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => !added && handleAddToPlaylist(t.id)}
                        disabled={added}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                          added
                            ? 'bg-[rgba(255,255,255,0.06)] text-[#9CA3AF] cursor-default border border-[rgba(255,255,255,0.08)]'
                            : 'bg-[rgba(212,0,0,0.1)] text-[#D40000] border border-[rgba(212,0,0,0.25)] hover:bg-[rgba(212,0,0,0.2)]'
                        }`}
                      >
                        {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {added ? 'Added' : 'Add'}
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                {tracks.map((t, i) => (
                  <SongRow
                    key={t.id}
                    track={t}
                    index={i}
                    liked={isLiked(t.id)}
                    onLike={() => toggleLike(t.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </section>

      {!isAddMode && (
        <section className="container-premium pb-16">
          <div className="flex flex-wrap gap-3 pt-4">
            {[
              { label: 'Browse Albums', href: '/albums' },
              { label: 'View Playlists', href: '/playlists' },
              { label: 'Coming Soon', href: '/upcoming' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-sm text-[#9CA3AF] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}

export default function SongsPage() {
  return (
    <Suspense fallback={<div className="bg-[#000000] min-h-screen" />}>
      <SongsContent />
    </Suspense>
  );
}
