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

// â”€â”€â”€ Animation Variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Section Wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Divider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SectionDivider = () => (
  <div className="container-premium">
    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
  </div>
);

// â”€â”€â”€ Play All Top Picks Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PlayAllButton = ({ tracks }: { tracks: typeof TOP_PICKS }) => {
  const { setQueue, playTrack } = usePlayerStore();

  const handlePlayAll = useCallback(() => {
    const queue: StoreTrack[] = tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album ?? '',
      duration: t.duration,
      image: t.image, coverUrl: t.image,
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

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      image: t.image, coverUrl: t.image,
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

      {/* â”€â”€ 1. HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <PremiumHeroSection
        onPlayClick={handleStartListening}
      />

      {/* â”€â”€ 2. FEATURED SONGS BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ 3. TOP PICKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

          {/* Song rows â€” two columns on large screens */}
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

      {/* â”€â”€ 4. RECENT RELEASES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ 5. UPCOMING RELEASES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
            subtitle="Upcoming drops to add to your watchlist â€” get notified first"
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

      {/* â”€â”€ 6. FEATURED PLAYLISTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ 8. FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}

      {/* Stay Connected */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(212,0,0,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 40% 40% at 20% 80%, rgba(212,0,0,0.05) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-[#9CA3AF] font-medium tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D40000] animate-pulse" />
            Stay Connected
          </div>

          <h2
            className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-poppins,sans-serif)" }}
          >
            Follow the{" "}
            <span className="text-[#D40000]">journey</span>
          </h2>

          <p className="text-[#9CA3AF] text-base lg:text-lg leading-relaxed max-w-xl mx-auto">
            New releases, live sessions, behind-the-scenes moments —
            follow for all of it as it happens.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              {
                label: "Instagram",
                href: "https://instagram.com/eshaniofficial",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/>
                  </svg>
                ),
              },
              {
                label: "YouTube",
                href: "https://youtube.com/@eshani",
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.1 5 12 5 12 5s-4.1 0-6.9.1c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.9.8 2.3.8C6.7 19 12 19 12 19s4.1 0 6.9-.1c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.7V9.3l5.6 2.7-5.6 2.7z"/>
                  </svg>
                ),
              },
              {
                label: "X / Twitter",
                href: "https://x.com/eshanimusic",
                icon: (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.631 5.906-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                ),
              },
            ].map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-[#9CA3AF] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.14] transition-all"
              >
                {icon}
                {label}
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {["New music monthly", "Live sessions", "Exclusive drops", "Behind the scenes"].map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs text-[#4B5563] border border-white/[0.05] bg-white/[0.02]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Bottom padding for persistent audio player */}
      <div className="h-20 lg:h-24" aria-hidden="true" />
    </div>
  );
}

