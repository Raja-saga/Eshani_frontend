'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Music2,
  Mail,
  Camera,
  PlayCircle,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import {
  SectionHeader,
  SongRow,
  AlbumCard,
  UpcomingTrackCard,
  Carousel,
  Footer,
} from '@/components';
import {
  FEATURED_SONGS,
  TOP_PICKS,
  RECENT_RELEASES,
  UPCOMING_RELEASES,
  ESHANI_PHOTOS,
} from '@/data/mockData';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import { Track as StoreTrack } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const ESHANI_BIO =
  `ESHANI is an independent pop/R&B artist blending Kannada roots with global sounds — from hip-hop to indie pop. With hits like "Not Your Typical Brown Girl" and "FREAK", she's carved out a sound that is entirely her own. No label. No middleman. Just music that moves.`;

const SOCIAL_LINKS = [
  { icon: Mail, href: 'mailto:contact@eshanimusic.com', label: 'Email' },
  { icon: Camera, href: 'https://www.instagram.com/eshanimusic/', label: 'Instagram' },
  { icon: PlayCircle, href: 'https://www.youtube.com/channel/UCBE-u957n8OCA66RHIb-EyA', label: 'YouTube' },
];

const STATS = [
  { value: '50+', label: 'Tracks' },
  { value: '5', label: 'Albums' },
  { value: '2M+', label: 'Monthly Listeners' },
  { value: '8+', label: 'Years Active' },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
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

const SectionDivider = () => (
  <div className="container-premium">
    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
  </div>
);

// ─── helpers ─────────────────────────────────────────────────────────────────

function toStoreTrack(t: typeof TOP_PICKS[0], liked = false): StoreTrack {
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
    youtubeId: t.youtubeId,
    isPremium: t.isPremium,
  };
}

// ─── Play All Button ──────────────────────────────────────────────────────────

const PlayAllButton = ({ tracks }: { tracks: typeof TOP_PICKS }) => {
  const { setQueue, playTrack } = usePlayerStore();
  const { isLiked } = useLibraryStore();
  const handlePlayAll = useCallback(() => {
    const queue = tracks.map((t) => toStoreTrack(t, isLiked(t.id)));
    setQueue(queue);
    playTrack(queue[0]);
  }, [tracks, setQueue, playTrack, isLiked]);

  return (
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,0,0,0.3)' }}
      whileTap={{ scale: 0.97 }}
      onClick={handlePlayAll}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
      aria-label="Play all tracks"
    >
      <Play className="w-4 h-4 fill-current" />
      Play All
    </motion.button>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EshaniPage() {
  const { setQueue, playTrack } = usePlayerStore();
  const { isLiked, toggleLike } = useLibraryStore();

  const handlePlayDiscography = useCallback(() => {
    const queue = FEATURED_SONGS.map((t) => toStoreTrack(t, isLiked(t.id)));
    setQueue(queue);
    playTrack(queue[0]);
  }, [setQueue, playTrack, isLiked]);

  const handlePlay = useCallback((label: string) => {
    console.info('Play:', label);
  }, []);

  return (
    <div className="bg-[#000000] text-[#FFFFFF] overflow-hidden">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden bg-[#000000]">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={ESHANI_PHOTOS.hero}
            alt="ESHANI"
            fill
            priority
            unoptimized
            className="object-cover object-top opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.2)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-transparent to-transparent" />
        </div>

        {/* Animated glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,0,0,0.2) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 container-premium pb-16 pt-32 w-full">
          <div className="max-w-2xl">
            {/* Verified badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-4"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D40000]" />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D40000]">
                Verified Artist
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="font-black text-[#FFFFFF] leading-none mb-4"
              style={{
                fontFamily: 'var(--font-poppins, sans-serif)',
                fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              }}
            >
              ESHANI
            </motion.h1>

            {/* Genre tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {['Electronic', 'Alternative', 'Indie Pop', 'R&B'].map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-[#9CA3AF] bg-white/[0.04]"
                >
                  {g}
                </span>
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap gap-8 mb-8"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <p
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(212,0,0,0.4)' }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePlayDiscography}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#D40000] text-white font-semibold rounded-2xl hover:bg-[#8B1111] transition-all text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Discography
              </motion.button>

              <Link
                href="https://www.instagram.com/eshanimusic/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.span
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 border border-white/15 text-white font-semibold rounded-2xl glass-effect transition-all text-sm"
                >
                  <Headphones className="w-4 h-4" />
                  Follow
                </motion.span>
              </Link>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-2 mt-6"
            >
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#9CA3AF] hover:text-[#D40000] hover:border-[rgba(212,0,0,0.2)] transition-all text-xs font-medium"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BIOGRAPHY ───────────────────────────────────────────────────── */}
      <Section id="biography">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-0.5 w-10 bg-[#D40000] origin-left rounded-full"
            />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D40000]">
              About
            </span>
          </div>
          <h2
            className="text-[1.875rem] lg:text-[2.25rem] font-bold text-white mb-5 leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            The Artist
          </h2>
          <p className="text-[#D9D9D9] text-lg leading-relaxed whitespace-pre-line">
            {ESHANI_BIO}
          </p>
        </motion.div>
      </Section>

      <SectionDivider />

      {/* ── POPULAR SONGS ────────────────────────────────────────────────── */}
      <Section id="popular-songs" className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,0,0,0.05) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
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
                Popular Songs
              </h2>
              <p className="text-[0.9375rem] text-[#9CA3AF]">
                Most-streamed tracks from ESHANI
              </p>
            </div>
            <PlayAllButton tracks={TOP_PICKS} />
          </motion.div>

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

      {/* ── FEATURED TRACKS ─────────────────────────────────────────────── */}
      <Section id="featured-tracks">
        <SectionHeader
          title="Featured Tracks"
          subtitle="Highlighted picks from the full discography"
          seeAllHref="/discover"
        />
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-1"
        >
          {FEATURED_SONGS.slice(0, 6).map((track, i) => (
            <SongRow
              key={track.id}
              track={track}
              index={i}
              liked={isLiked(track.id)}
              onLike={() => toggleLike(track.id)}
            />
          ))}
        </motion.div>
      </Section>

      <SectionDivider />

      {/* ── ALBUMS ──────────────────────────────────────────────────────── */}
      <Section id="albums" className="relative">
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
            title="Albums & Releases"
            subtitle="The complete ESHANI discography"
            seeAllHref="/library"
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
                onPlay={() => handlePlay(release.title)}
                onLike={() => console.info('Like:', release.title)}
              />
            ))}
          </motion.div>
        </div>
      </Section>

      <SectionDivider />

      {/* ── UPCOMING RELEASES ───────────────────────────────────────────── */}
      <Section id="upcoming" className="relative">
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
            subtitle="Upcoming drops — be the first to know"
            seeAllHref="/discover"
          />
          <Carousel cardMinWidth={180}>
            {UPCOMING_RELEASES.map((release, i) => (
              <UpcomingTrackCard key={release.id} release={release} index={i} />
            ))}
          </Carousel>
        </div>
      </Section>

      <SectionDivider />

      {/* ── CONNECT CTA ─────────────────────────────────────────────────── */}
      <Section id="connect" className="relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,0,0,0.15) 0%, transparent 65%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-7"
          >
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-3xl bg-[rgba(212,0,0,0.1)] border border-[rgba(212,0,0,0.2)] flex items-center justify-center"
                aria-hidden="true"
              >
                <Music2 className="w-9 h-9 text-[#D40000]" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2
                className="text-[2rem] lg:text-[2.75rem] font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
              >
                Stay{' '}
                <span className="gradient-text">Connected</span>
              </h2>
              <p className="text-lg text-[#D9D9D9] leading-relaxed">
                Get notified first for every new release, behind-the-scenes drop, and live event.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-1">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  whileHover={{ scale: 1.08 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-[#9CA3AF] hover:text-[#D40000] hover:border-[rgba(212,0,0,0.25)] bg-white/[0.03] transition-all text-sm font-medium"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <Footer />

      {/* Bottom padding for persistent audio player */}
      <div className="h-20 lg:h-24" aria-hidden="true" />
    </div>
  );
}
