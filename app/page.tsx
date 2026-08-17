'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PremiumHeroSection,
  Carousel,
  AlbumCard,
  PlaylistCard,
  SongRow,
  SectionHeader,
  Footer,
  FeaturedSongBanner,
  UpcomingTrackCard,
} from '@/components';

import {
  FEATURED_SONGS,
  TOP_PICKS,
  RECENT_RELEASES,
  UPCOMING_RELEASES,
  FEATURED_PLAYLISTS,
} from '@/data/mockData';
import { Flame, Sparkles, Radio, Mail, Play, Music2 } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import { Track as StoreTrack } from '@/types';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const Section = ({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`section-spacing ${className}`}>
    <div className="container-premium">{children}</div>
  </section>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
const SectionDivider = () => (
  <div className="container-premium">
    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
  </div>
);

// ─── Play All Top Picks Button ────────────────────────────────────────────────
const PlayAllButton = ({ tracks }: { tracks: typeof TOP_PICKS }) => {
  const { setQueue, playTrack } = usePlayerStore();

  const handlePlayAll = useCallback(() => {
    const queue: StoreTrack[] = tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album ?? '',
      duration: t.duration,
      coverUrl: t.image,
      audioUrl: t.audioUrl ?? '',
      genre: t.genre ?? '',
      plays: t.plays ?? 0,
      liked: false,
    }));
    setQueue(queue);
    playTrack(queue[0]);
  }, [tracks, setQueue, playTrack]);

  return (
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,0,0,0.3)' }}
      whileTap={{ scale: 0.97 }}
      onClick={handlePlayAll}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
      aria-label="Play all top picks"
    >
      <Play className="w-4 h-4 fill-current" />
      Play All
    </motion.button>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { setQueue, playTrack } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();

  const handleStartListening = useCallback(() => {
    const queue: StoreTrack[] = FEATURED_SONGS.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album ?? '',
      duration: t.duration,
      coverUrl: t.image,
      audioUrl: t.audioUrl ?? '',
      genre: t.genre ?? '',
      plays: t.plays ?? 0,
      liked: false,
    }));
    setQueue(queue);
    playTrack(queue[0]);
  }, [setQueue, playTrack]);

  return (
    <div className="bg-[#000000] text-[#FFFFFF] overflow-hidden">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <PremiumHeroSection
        onPlayClick={handleStartListening}
      />

      {/* ── 2. FEATURED SONGS BANNER ──────────────────────────────────────── */}
      <Section id="featured-songs">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <SectionHeader
            title="Featured Songs"
            subtitle="Hand-picked tracks making waves this week"
            seeAllHref="/songs?section=featured"
          />
        </motion.div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <FeaturedSongBanner songs={FEATURED_SONGS} />
        </motion.div>
      </Section>

      <SectionDivider />

      {/* ── 3. TOP PICKS ──────────────────────────────────────────────────── */}
      <Section id="top-picks" className="relative">
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,0,0,0.05) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          {/* Header with Play All */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex items-end justify-between mb-8 lg:mb-10"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="h-0.5 w-10 bg-[#D40000] origin-left rounded-full"
              />
              <h2
                className="text-[1.875rem] lg:text-[2.25rem] font-bold text-[#FFFFFF] leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
              >
                Top Picks For You
              </h2>
              <p className="text-[0.9375rem] text-[#9CA3AF] font-normal leading-relaxed">
                Personalised recommendations based on your taste
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <PlayAllButton tracks={TOP_PICKS} />
              <motion.a
                href="/songs?section=top-picks"
                whileHover={{ x: 4 }}
                className="flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[#D40000] transition-colors duration-200 pb-1"
              >
                See All
              </motion.a>
            </div>
          </motion.div>

          {/* Song rows — two columns on large screens */}
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-1"
          >
            {TOP_PICKS.map((track, i) => (
              <SongRow
                key={track.id}
                track={track}
                index={i}
                liked={isLiked(track.id)}
                onLike={() => toggleLike(track.id)}
              />
            ))}
          </motion.div>
        </div>
      </Section>

      <SectionDivider />

      {/* ── 4. RECENT RELEASES ────────────────────────────────────────────── */}
      <Section id="recent-releases" className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 90% 50%, rgba(212,0,0,0.04) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <SectionHeader
            title="Recent Releases"
            subtitle="Fresh music from ESHANI"
            seeAllHref="/songs?section=recent"
          />

          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5"
          >
            {RECENT_RELEASES.map((release, i) => (
              <AlbumCard
                key={release.id}
                id={release.id}
                title={release.title}
                artist={release.artist}
                image={release.image}
                duration={release.duration}
                audioUrl={release.audioUrl}
                badge="New"
                badgeVariant="primary"
                releaseDate={release.releaseDate}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      </Section>

      <SectionDivider />

      {/* ── 5. UPCOMING RELEASES ──────────────────────────────────────────── */}
      <Section id="upcoming-releases" className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 10% 50%, rgba(212,0,0,0.04) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <SectionHeader
            title="Coming Soon"
            subtitle="Upcoming drops to add to your watchlist — get notified first"
          />

          {/* Upcoming as a grid carousel */}
          <Carousel cardMinWidth={180}>
            {UPCOMING_RELEASES.map((release, i) => (
              <UpcomingTrackCard key={release.id} release={release} index={i} />
            ))}
          </Carousel>
        </div>
      </Section>

      <SectionDivider />

      {/* ── 6. FEATURED PLAYLISTS ─────────────────────────────────────────── */}
      <Section id="featured-playlists" className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 20% 60%, rgba(212,0,0,0.04) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <SectionHeader
            title="Featured Playlists"
            subtitle="Expertly curated collections for every mood and moment"
          />
    
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5"
          >
            {FEATURED_PLAYLISTS.map((playlist, i) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      </Section>

      <SectionDivider />

      {/* ── 7. STAY CONNECTED (Newsletter CTA) ───────────────────────────── */}
      <Section id="stay-connected" className="relative overflow-hidden">
        {/* Animated background orb */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,0,0,0.15) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        {/* Secondary decorative orb */}
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,0,0,0.08) 0%, transparent 65%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-3xl bg-[rgba(212,0,0,0.1)] border border-[rgba(212,0,0,0.2)] flex items-center justify-center shadow-lg shadow-[#D40000]/10"
                aria-hidden="true"
              >
                <Music2 className="w-9 h-9 text-[#D40000]" />
              </motion.div>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2
                className="text-[2.25rem] lg:text-[3rem] font-black text-[#FFFFFF] leading-tight"
                style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
              >
                Stay{' '}
                <span className="gradient-text">Connected</span>
              </h2>
              <p className="text-lg text-[#D9D9D9] leading-relaxed max-w-xl mx-auto">
                Get exclusive access to new releases, artist spotlights, and curated playlists
                delivered directly to your inbox.
              </p>
            </div>

            {/* Email form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                placeholder="Enter your email address"
                className="flex-1 h-14 px-5 rounded-2xl text-base bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none transition-all"
                aria-label="Email address for newsletter subscription"
              />
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(212,0,0,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="h-14 px-8 rounded-2xl bg-[#D40000] text-white font-semibold text-base hover:bg-[#8B1111] transition-all whitespace-nowrap flex items-center gap-2 justify-center shadow-lg shadow-[#D40000]/20"
                aria-label="Subscribe to newsletter"
              >
                <Mail className="w-4 h-4" />
                Subscribe
              </motion.button>
            </motion.div>

            <p className="text-sm text-[#9CA3AF]">
              We respect your privacy. No spam, ever. Unsubscribe at any time.
            </p>

            {/* Feature tags */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {[
                { icon: Sparkles, label: 'Exclusive Content' },
                { icon: Flame, label: 'Early Releases' },
                { icon: Radio, label: 'Artist Spotlights' },
              ].map(({ icon: Icon, label }) => (
                <motion.span
                  key={label}
                  whileHover={{ scale: 1.05, borderColor: 'rgba(212,0,0,0.3)' }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.08)] text-xs text-[#9CA3AF] bg-[rgba(255,255,255,0.03)] cursor-default"
                >
                  <Icon className="w-3.5 h-3.5 text-[#D40000]" aria-hidden="true" />
                  {label}
                </motion.span>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <motion.a
                href="https://www.instagram.com/eshanimusic/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#D40000] transition-colors"
                aria-label="ESHANI on Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </motion.a>
              <span className="w-px h-4 bg-[rgba(255,255,255,0.12)]" aria-hidden="true" />
              <motion.a
                href="https://www.youtube.com/channel/UCBE-u957n8OCA66RHIb-EyA"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08 }}
                className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#D40000] transition-colors"
                aria-label="ESHANI on YouTube"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YouTube
              </motion.a>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── 8. FOOTER ─────────────────────────────────────────────────────── */}
      <Footer />

      {/* Bottom padding for persistent audio player */}
      <div className="h-20 lg:h-24" aria-hidden="true" />
    </div>
  );
}
