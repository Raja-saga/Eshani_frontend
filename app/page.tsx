'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  FEATURED_PLAYLISTS,
  Track,
  UpcomingRelease,
} from '@/data/mockData';
import { Play } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import { Track as StoreTrack } from '@/types';
import { useLiveCatalog } from '@/hooks/useLiveCatalog';

interface SiteSettings {
  instagram_url: string;
  youtube_url: string;
  spotify_url: string;
  twitter_url: string;
  apple_music_url: string;
  new_release_banner: string;
}

// â"€â"€â"€ Animation Variants â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
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

// â"€â"€â"€ Divider â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const SectionDivider = () => (
  <div className="container-premium">
    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
  </div>
);

// â"€â"€â"€ Play All Top Picks Button â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const PlayAllButton = ({ tracks }: { tracks: Track[] }) => {
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

// â"€â"€â"€ Main Page â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
export default function HomePage() {
  const { setQueue, playTrack } = usePlayerStore();
  const { toggleLike, isLiked } = useLibraryStore();
  const { songs: allSongs, recentSongs, newUploads } = useLiveCatalog();

  // Top Picks: new uploads first, then curated mockData TOP_PICKS
  const topPickIds = new Set(TOP_PICKS.map((s) => s.id));
  const liveTopPicks: Track[] = [
    ...newUploads,
    ...allSongs.filter((s) => topPickIds.has(s.id)),
  ];

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    instagram_url: 'https://instagram.com/eshaniofficial',
    youtube_url: 'https://youtube.com/@eshani',
    spotify_url: 'https://open.spotify.com/artist/4CQMCs1zM49VQiI6Og0VWg',
    twitter_url: 'https://x.com/eshanimusic',
    apple_music_url: '',
    new_release_banner: 'true',
  });
  const [upcomingReleases, setUpcomingReleases] = useState<UpcomingRelease[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setSiteSettings(prev => ({ ...prev, ...d.settings })))
      .catch(() => {});
    fetch('/api/upcoming')
      .then(r => r.json())
      .then(d => setUpcomingReleases(d.releases ?? []))
      .catch(() => {});
  }, []);

  const handleStartListening = useCallback(() => {
    const queue: StoreTrack[] = FEATURED_SONGS.map((t) => ({
      id: t.id, title: t.title, artist: t.artist, album: t.album ?? '',
      duration: t.duration, image: t.image, coverUrl: t.image,
      audioUrl: t.audioUrl ?? '', genre: t.genre ?? '', plays: t.plays ?? 0, liked: false,
    }));
    setQueue(queue);
    playTrack(queue[0]);
  }, [setQueue, playTrack]);

  const handlePlayPlaylist = useCallback((songIds: string[]) => {
    const songs = allSongs.filter(s => songIds.includes(s.id))
      .sort((a, b) => songIds.indexOf(a.id) - songIds.indexOf(b.id));
    if (songs.length === 0) return;
    const queue: StoreTrack[] = songs.map(t => ({
      id: t.id, title: t.title, artist: t.artist, album: t.album ?? '',
      duration: t.duration, image: t.image, coverUrl: t.image,
      audioUrl: t.audioUrl ?? '', genre: t.genre ?? '', plays: t.plays ?? 0,
      liked: isLiked(t.id),
    }));
    setQueue(queue);
    playTrack(queue[0]);
  }, [setQueue, playTrack, isLiked, allSongs]);

  return (
    <div className="bg-[#000000] text-[#FFFFFF] overflow-hidden">

      {/* â"€â"€ 1. HERO â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <PremiumHeroSection
        onPlayClick={handleStartListening}
      />

      {/* â"€â"€ 2. FEATURED SONGS BANNER â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
            itemCount={FEATURED_SONGS.length}
            showThreshold={6}
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

      {/* â"€â"€ 3. TOP PICKS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
              <PlayAllButton tracks={liveTopPicks} />
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
            {liveTopPicks.map((track, i) => (
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

      {/* â"€â"€ 4. RECENT RELEASES â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
            itemCount={recentSongs.length}
            showThreshold={6}
          />

          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5"
          >
            {recentSongs.slice(0, 6).map((release, i) => (
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

      {/* â"€â"€ 5. UPCOMING RELEASES (controlled by New Release Banner toggle in admin settings) â"€â"€ */}
      {siteSettings.new_release_banner === 'true' && (
        <>
          <Section id="upcoming-releases" className="relative">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 60% 60% at 10% 50%, rgba(212,0,0,0.04) 0%, transparent 60%)' }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <SectionHeader
                title="Coming Soon"
                subtitle="Upcoming drops — be the first to know"
                seeAllHref={upcomingReleases.length > 3 ? '/upcoming' : undefined}
              />
              <Carousel cardMinWidth={180}>
                {upcomingReleases.slice(0, 3).map((release, i) => (
                  <UpcomingTrackCard key={release.id} release={release} index={i} />
                ))}
              </Carousel>
            </div>
          </Section>
          <SectionDivider />
        </>
      )}

      {/* â"€â"€ 6. FEATURED PLAYLISTS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
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
            seeAllHref="/playlists"
            itemCount={FEATURED_PLAYLISTS.length}
            showThreshold={6}
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
                onPlay={() => handlePlayPlaylist(playlist.songIds ?? [])}
              />
            ))}
          </motion.div>
        </div>
      </Section>

      {/* â"€â"€ 8. FOOTER â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}

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
              siteSettings.instagram_url && {
                label: "Instagram",
                href: siteSettings.instagram_url,
                icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/></svg>,
              },
              siteSettings.youtube_url && {
                label: "YouTube",
                href: siteSettings.youtube_url,
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.1 5 12 5 12 5s-4.1 0-6.9.1c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.9.8 2.3.8C6.7 19 12 19 12 19s4.1 0 6.9-.1c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.7V9.3l5.6 2.7-5.6 2.7z"/></svg>,
              },
              siteSettings.spotify_url && {
                label: "Spotify",
                href: siteSettings.spotify_url,
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 01.257 1.072zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.073 9.404-.866 13.115 1.338a.936.936 0 01-.954 1.608z"/></svg>,
              },
              siteSettings.twitter_url && {
                label: "X / Twitter",
                href: siteSettings.twitter_url,
                icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.631 5.906-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
              },
            ].filter((x): x is { label: string; href: string; icon: React.JSX.Element } => !!x).map(({ label, href, icon }) => (
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

