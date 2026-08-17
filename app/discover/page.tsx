'use client';

import React, { useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  SongRow,
  AlbumCard,
  PlaylistCard,
  UpcomingTrackCard,
  SectionHeader,
  Carousel,
  Footer,
} from '@/components';
import {
  TOP_PICKS,
  RECENT_RELEASES,
  UPCOMING_RELEASES,
  FEATURED_PLAYLISTS,
  ALBUMS,
  ALL_SONGS,
} from '@/data/mockData';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import { Track as StoreTrack } from '@/types';
import { Search, Play, Music2, Disc3, ListMusic, Clock } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const Section = ({ children, id }: { children: React.ReactNode; id?: string }) => (
  <section id={id} className="section-spacing">
    <div className="container-premium">{children}</div>
  </section>
);

const Divider = () => (
  <div className="container-premium">
    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
  </div>
);

function toStoreTrack(t: typeof ALL_SONGS[0], liked: boolean): StoreTrack {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album ?? '',
    duration: t.duration,
    coverUrl: t.image,
    audioUrl: t.audioUrl ?? '',
    genre: t.genre ?? '',
    plays: t.plays ?? 0,
    liked,
  };
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';
  const { toggleLike, isLiked } = useLibraryStore();
  const { setQueue, playTrack } = usePlayerStore();

  const handlePlayAll = useCallback((tracks: typeof ALL_SONGS) => {
    const queue = tracks.map((t) => toStoreTrack(t, isLiked(t.id)));
    setQueue(queue);
    if (queue[0]) playTrack(queue[0]);
  }, [setQueue, playTrack, isLiked]);

  const popularSongs = [...ALL_SONGS].sort((a, b) => (b.plays ?? 0) - (a.plays ?? 0));

  const searchResults = q
    ? ALL_SONGS.filter(
        (t) =>
          t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.genre?.toLowerCase().includes(q.toLowerCase()) ||
          t.album?.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen overflow-hidden">
      {/* Page Header */}
      <div className="container-premium pt-28 pb-4">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="h-0.5 w-10 bg-[#D40000] rounded-full mb-3" />
          <h1
            className="text-4xl lg:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            Discover
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-base">
            Explore the complete ESHANI catalog — every track, every album, every release
          </p>
        </motion.div>

        {/* Quick browse pills */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {[
            { label: 'Popular Songs', href: '#popular', icon: Music2 },
            { label: 'Albums', href: '#albums', icon: Disc3 },
            { label: 'Playlists', href: '#playlists', icon: ListMusic },
            { label: 'Upcoming', href: '#upcoming', icon: Clock },
            { label: 'All Songs', href: '/songs', icon: Search },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.09)] border border-[rgba(255,255,255,0.07)] transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Search Results */}
      {q && (
        <>
          <Section>
            <SectionHeader
              title={`Results for "${q}"`}
              subtitle={`${searchResults.length} tracks found`}
              seeAllHref={`/songs?q=${encodeURIComponent(q)}`}
            />
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Search className="w-12 h-12 text-[#9CA3AF]" />
                <p className="text-[#9CA3AF] text-lg">No tracks match &ldquo;{q}&rdquo;</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                {searchResults.slice(0, 8).map((t, i) => (
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
          </Section>
          <Divider />
        </>
      )}

      {/* Popular Songs */}
      <Section id="popular">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="space-y-2">
            <div className="h-0.5 w-10 bg-[#D40000] rounded-full" />
            <h2
              className="text-3xl lg:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
            >
              Popular Songs
            </h2>
            <p className="text-[#9CA3AF] text-[0.9375rem]">ESHANI&apos;s most-streamed tracks</p>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(212,0,0,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePlayAll(TOP_PICKS)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Play All
            </motion.button>
            <motion.a href="/songs?section=popular" whileHover={{ x: 4 }} className="text-sm font-medium text-[#9CA3AF] hover:text-[#D40000] transition-colors pb-1">
              See All
            </motion.a>
          </div>
        </div>
        <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          {popularSongs.slice(0, 8).map((t, i) => (
            <SongRow key={t.id} track={t} index={i} liked={isLiked(t.id)} onLike={() => toggleLike(t.id)} />
          ))}
        </motion.div>
      </Section>

      <Divider />

      {/* Latest Releases */}
      <Section id="latest">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="space-y-2">
            <div className="h-0.5 w-10 bg-[#D40000] rounded-full" />
            <h2
              className="text-3xl lg:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
            >
              Latest Releases
            </h2>
            <p className="text-[#9CA3AF] text-[0.9375rem]">Freshest music from ESHANI</p>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(212,0,0,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePlayAll(RECENT_RELEASES)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Play All
            </motion.button>
            <motion.a href="/songs?section=recent" whileHover={{ x: 4 }} className="text-sm font-medium text-[#9CA3AF] hover:text-[#D40000] transition-colors pb-1">
              See All
            </motion.a>
          </div>
        </div>
        <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          {RECENT_RELEASES.map((t, i) => (
            <SongRow key={t.id} track={t} index={i} liked={isLiked(t.id)} onLike={() => toggleLike(t.id)} />
          ))}
        </motion.div>
      </Section>

      <Divider />

      {/* Albums */}
      <Section id="albums">
        <SectionHeader
          title="Albums"
          subtitle="Complete studio collections"
          seeAllHref="/albums"
        />
        <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {ALBUMS.map((a, i) => (
            <AlbumCard
              key={a.id}
              id={a.id}
              title={a.title}
              artist="ESHANI"
              image={a.image}
              trackCount={a.trackCount}
              releaseDate={new Date(a.releaseDate).getFullYear().toString()}
              index={i}
            />
          ))}
        </motion.div>
      </Section>

      <Divider />

      {/* Featured Playlists */}
      <Section id="playlists">
        <SectionHeader
          title="Playlists"
          subtitle="Curated collections for every mood"
          seeAllHref="/playlists"
        />
        <motion.div variants={gridVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {FEATURED_PLAYLISTS.map((p, i) => (
            <PlaylistCard key={p.id} playlist={p} index={i} />
          ))}
        </motion.div>
      </Section>

      <Divider />

      {/* Upcoming Releases */}
      <Section id="upcoming">
        <SectionHeader
          title="Coming Soon"
          subtitle="Upcoming drops — get notified first"
          seeAllHref="/upcoming"
        />
        <Carousel cardMinWidth={180}>
          {UPCOMING_RELEASES.map((r, i) => (
            <UpcomingTrackCard key={r.id} release={r} index={i} />
          ))}
        </Carousel>
      </Section>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="bg-[#000000] min-h-screen" />}>
      <DiscoverContent />
    </Suspense>
  );
}
