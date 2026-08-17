'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SongRow, SectionHeader, Footer } from '@/components';
import {
  FEATURED_SONGS,
  TOP_PICKS,
  RECENT_RELEASES,
  ALL_SONGS,
} from '@/data/mockData';
import useLibraryStore from '@/store/libraryStore';
import { Search, X } from 'lucide-react';

type SectionKey = 'all' | 'popular' | 'recent' | 'featured' | 'top-picks';

const SECTION_TABS: { key: SectionKey; label: string }[] = [
  { key: 'all', label: 'All Songs' },
  { key: 'popular', label: 'Popular' },
  { key: 'recent', label: 'Recent' },
  { key: 'featured', label: 'Featured' },
  { key: 'top-picks', label: 'Top Picks' },
];

const SECTION_MAP: Record<SectionKey, typeof ALL_SONGS> = {
  all: ALL_SONGS,
  popular: [...ALL_SONGS].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0)),
  recent: RECENT_RELEASES,
  featured: FEATURED_SONGS,
  'top-picks': TOP_PICKS,
};

const SECTION_SUBTITLES: Record<SectionKey, string> = {
  all: `${ALL_SONGS.length} tracks — the complete ESHANI catalog`,
  popular: 'Sorted by most streams',
  recent: 'Newest releases first',
  featured: 'Hand-picked highlights',
  'top-picks': 'Personalised picks for you',
};

function SongsContent() {
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get('section') as SectionKey) ?? 'all';
  const initialQ = searchParams.get('q') ?? '';

  const [section, setSection] = useState<SectionKey>(
    SECTION_MAP[initialSection] ? initialSection : 'all'
  );
  const [query, setQuery] = useState(initialQ);
  const { toggleLike, isLiked } = useLibraryStore();

  const tracks = useMemo(() => {
    const base = SECTION_MAP[section];
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.genre?.toLowerCase().includes(q) ||
        t.album?.toLowerCase().includes(q)
    );
  }, [section, query]);

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Header */}
      <div className="container-premium pt-28 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-0.5 w-10 bg-[#D40000] rounded-full mb-3" />
          <h1
            className="text-4xl lg:text-5xl font-black text-white leading-tight mb-2"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            Songs
          </h1>
          <p className="text-[#9CA3AF] text-base">
            {SECTION_SUBTITLES[section]}
          </p>
        </motion.div>

        {/* Search + Filter row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, genres, albums..."
              className="w-full h-12 pl-11 pr-10 rounded-2xl text-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none transition-all"
              aria-label="Search songs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#9CA3AF] hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter tabs */}
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
        </motion.div>
      </div>

      {/* Songs List */}
      <section className="container-premium pb-8">
        {tracks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <Search className="w-12 h-12 text-[#9CA3AF]" />
            <p className="text-[#9CA3AF] text-lg">No songs match your search</p>
            <button
              onClick={() => setQuery('')}
              className="text-sm text-[#D40000] hover:underline"
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-[#9CA3AF] mb-4 ml-4">
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
              {query && ` for "${query}"`}
            </p>
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
          </motion.div>
        )}
      </section>

      {/* Quick links */}
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
