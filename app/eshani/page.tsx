'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  ESHANI_PHOTOS,
  UpcomingRelease,
} from '@/data/mockData';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import { Track as StoreTrack } from '@/types';
import { useLiveAlbums } from '@/hooks/useLiveAlbums';

// â"€â"€â"€ Constants â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const ESHANI_BIO =
  `ESHANI is an independent pop/R&B artist blending Kannada roots with global sounds â€" from hip-hop to indie pop. With hits like "Not Your Typical Brown Girl" and "FREAK", she's carved out a sound that is entirely her own. No label. No middleman. Just music that moves.`;

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

// â"€â"€â"€ Animation Variants â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

// â"€â"€â"€ Section Wrapper â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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

// â"€â"€â"€ helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function toStoreTrack(t: typeof TOP_PICKS[0], liked = false): StoreTrack {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album ?? '',
    duration: t.duration,
    image: t.image, coverUrl: t.image,
    audioUrl: t.audioUrl ?? '',
    genre: t.genre ?? '',
    plays: t.plays ?? 0,
    liked,
    youtubeId: t.youtubeId,
    isPremium: t.isPremium,
  };
}

// â"€â"€â"€ Play All Button â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

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

// â"€â"€â"€ Main Page â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function EshaniPage() {
  const { setQueue, playTrack } = usePlayerStore();
  const { isLiked, toggleLike } = useLibraryStore();
  const { albums } = useLiveAlbums();
  const [upcomingReleases, setUpcomingReleases] = useState<UpcomingRelease[]>([]);
  const [eshaniHeroImage, setEshaniHeroImage] = useState('');

  useEffect(() => {
    fetch('/api/upcoming')
      .then(r => r.json())
      .then(d => setUpcomingReleases(
        (d.releases ?? []).map((r: { id: string; title: string; artist: string; image_url: string; release_date: string | null; genre: string | null; pre_orders: number }) => ({
          id: r.id, title: r.title, artist: r.artist,
          image: r.image_url, releaseDate: r.release_date ?? '', genre: r.genre ?? '', preOrders: r.pre_orders,
        }))
      ))
      .catch(() => {});
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.settings?.eshani_hero_image) setEshaniHeroImage(d.settings.eshani_hero_image); })
      .catch(() => {});
  }, []);

  const handlePlayDiscography = useCallback(() => {
    const queue = FEATURED_SONGS.map((t) => toStoreTrack(t, isLiked(t.id)));
    setQueue(queue);
    playTrack(queue[0]);
  }, [setQueue, playTrack, isLiked]);

  return (
    <div className="bg-[#000000] text-[#FFFFFF] overflow-hidden">

      {/* ── HERO BANNER — PROTOTYPE STYLE ──────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 40%, #8B0000 100%)' }}
      >
        {/* Dark red vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[rgba(0,0,0,0.7)] to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent z-[1]" />

        {/* Animated red glow orb */}
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-[-5%] w-[700px] h-[500px] rounded-full pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(ellipse, rgba(212,0,0,0.25) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Anime music symbols image — top left decorative */}
        <div className="absolute top-0 left-0 w-[55%] h-full pointer-events-none z-[2] overflow-hidden">
          <Image
            src="/anime-music-symbols.jpg"
            alt=""
            fill
            className="object-cover object-left opacity-15 mix-blend-screen"
            sizes="55vw"
            aria-hidden="true"
            unoptimized
          />
        </div>

        {/* Artist photo — right side */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] lg:w-[50%] pointer-events-none z-[2]">
          <Image
            src="/eshani-artist.png"
            alt="ESHANI"
            fill
            priority
            unoptimized
            className="object-cover object-top"
            sizes="55vw"
          />
          {/* Fade the artist photo to blend with background on left edge */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0000] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
        </div>

        {/* ── LEFT PANEL — Content ────────────────────────────── */}
        <div className="relative z-10 container-premium w-full py-24 lg:py-32">
          <div className="max-w-xl">

            {/* ANIME MUSIC SYMBOLS above name */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-4"
              aria-hidden="true"
            >
              {/* Animated floating music notes — anime style */}
              {[
                { symbol: '♩', delay: 0, x: 0, size: 'text-3xl' },
                { symbol: '♪', delay: 0.3, x: 5, size: 'text-4xl' },
                { symbol: '♫', delay: 0.6, x: -3, size: 'text-2xl' },
                { symbol: '♬', delay: 0.9, x: 8, size: 'text-3xl' },
              ].map(({ symbol, delay, x, size }, i) => (
                <motion.span
                  key={i}
                  animate={{
                    y: [0, -12, 0],
                    x: [0, x, 0],
                    rotate: [0, i % 2 === 0 ? 15 : -15, 0],
                    filter: [
                      'drop-shadow(0 0 6px rgba(212,0,0,0.8))',
                      'drop-shadow(0 0 16px rgba(255,80,80,1))',
                      'drop-shadow(0 0 6px rgba(212,0,0,0.8))',
                    ],
                  }}
                  transition={{ duration: 2.5 + i * 0.4, delay, repeat: Infinity, ease: 'easeInOut' }}
                  className={`${size} font-black text-white`}
                  style={{ textShadow: '0 0 20px rgba(212,0,0,0.9), 0 0 40px rgba(212,0,0,0.5)' }}
                >
                  {symbol}
                </motion.span>
              ))}
            </motion.div>

            {/* ESHANI large handwriting-style name */}
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="font-black text-white leading-none mb-5 select-none"
              style={{
                fontFamily: 'var(--font-poppins, sans-serif)',
                fontSize: 'clamp(4.5rem, 13vw, 9rem)',
                textShadow: '4px 4px 0px rgba(0,0,0,0.5), 0 0 60px rgba(212,0,0,0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              ESHANI
            </motion.h1>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[1.15rem] lg:text-[1.35rem] text-[#D9D9D9] font-medium mb-6 leading-snug italic"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
            >
              Culture isn&apos;t where I fit. It&apos;s what I am
            </motion.p>

            {/* Tags: Singer-Songwriter, Vocalist, Lyricist, Independent Artist */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {['Singer-Songwriter', 'Vocalist', 'Lyricist', 'Independent Artist'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-[rgba(255,255,255,0.2)] text-[#D9D9D9] bg-[rgba(0,0,0,0.4)] backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons: PLAY NOW + FOLLOW */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: '0 0 36px rgba(212,0,0,0.55)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayDiscography}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#D40000] text-white font-bold rounded-2xl hover:bg-[#8B1111] transition-all text-sm uppercase tracking-wider shadow-xl shadow-[#D40000]/30"
                aria-label="Play now"
              >
                <Play className="w-5 h-5 fill-current" />
                PLAY NOW
              </motion.button>

              <Link
                href="https://www.instagram.com/eshanimusic/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.span
                  whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-3 px-8 py-4 border-2 border-[rgba(255,255,255,0.25)] text-white font-bold rounded-2xl backdrop-blur-sm transition-all text-sm uppercase tracking-wider"
                  style={{ background: 'rgba(0,0,0,0.35)' }}
                >
                  <Headphones className="w-5 h-5" />
                  FOLLOW
                </motion.span>
              </Link>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex gap-2 mt-7"
            >
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-[#9CA3AF] hover:text-[#D40000] hover:border-[rgba(212,0,0,0.3)] transition-all text-xs font-medium backdrop-blur-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* â"€â"€ BIOGRAPHY â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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

      {/* â"€â"€ POPULAR SONGS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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

      {/* â"€â"€ FEATURED TRACKS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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

      {/* â"€â"€ ALBUMS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
            seeAllHref="/albums"
          />
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5"
          >
            {albums.map((album, i) => (
              <AlbumCard
                key={album.id}
                id={album.id}
                title={album.title}
                artist="ESHANI"
                image={album.image}
                trackCount={album.trackCount}
                releaseDate={new Date(album.releaseDate).getFullYear().toString()}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      </Section>

      <SectionDivider />

      {/* â"€â"€ UPCOMING RELEASES â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
            subtitle="Upcoming drops - be the first to know"
            seeAllHref="/discover"
          />
          <Carousel cardMinWidth={180}>
            {upcomingReleases.map((release, i) => (
              <UpcomingTrackCard key={release.id} release={release} index={i} />
            ))}
          </Carousel>
        </div>
      </Section>

      <SectionDivider />

      {/* â"€â"€ CONNECT CTA â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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

      {/* â"€â"€ FOOTER â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <Footer />

      {/* Bottom padding for persistent audio player */}
      <div className="h-20 lg:h-24" aria-hidden="true" />
    </div>
  );
}

