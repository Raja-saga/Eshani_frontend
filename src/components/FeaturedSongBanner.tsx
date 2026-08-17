/**
 * FeaturedSongBanner Component
 *
 * A full-width premium banner showcasing the #1 featured track.
 * - Blurred album art background
 * - Animated progress ring
 * - Waveform visualizer
 * - Play All into queue button
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music2, TrendingUp, Headphones } from 'lucide-react';
import Image from 'next/image';
import { Track } from '@/data/mockData';
import { Track as StoreTrack } from '@/types';
import usePlayerStore from '@/store/playerStore';
import { formatDuration } from '@/utils/helpers';

interface FeaturedSongBannerProps {
  songs: Track[];
}

const FeaturedSongBanner: React.FC<FeaturedSongBannerProps> = ({ songs }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { playTrack, setQueue, currentTrack, isPlaying, setIsPlaying } = usePlayerStore();

  const featured = songs[activeIndex];
  const isCurrentlyPlaying = currentTrack?.id === featured.id && isPlaying;

  const formatPlays = (plays?: number) => {
    if (!plays) return '0';
    if (plays >= 1_000_000) return (plays / 1_000_000).toFixed(1) + 'M';
    if (plays >= 1_000) return (plays / 1_000).toFixed(0) + 'K';
    return plays.toString();
  };

  const handlePlay = () => {
    const storeTrack: StoreTrack = {
      id: featured.id,
      title: featured.title,
      artist: featured.artist,
      album: featured.album ?? '',
      duration: featured.duration,
      coverUrl: featured.image,
      audioUrl: featured.audioUrl ?? '',
      genre: featured.genre ?? '',
      plays: featured.plays ?? 0,
      liked: false,
    };
    if (currentTrack?.id === featured.id) {
      setIsPlaying(!isPlaying);
    } else {
      playTrack(storeTrack);
    }
  };

  const handlePlayAll = () => {
    const queue: StoreTrack[] = songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album ?? '',
      duration: s.duration,
      coverUrl: s.image,
      audioUrl: s.audioUrl ?? '',
      genre: s.genre ?? '',
      plays: s.plays ?? 0,
      liked: false,
    }));
    setQueue(queue);
    playTrack(queue[0]);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl" role="region" aria-label="Featured Songs">
      {/* Blurred background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image
            src={featured.image ?? featured.coverUrl ?? ''}
            alt=""
            fill
            className="object-cover blur-2xl scale-110 opacity-30"
            sizes="100vw"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-7 lg:p-10">
        {/* Left: Track info */}
        <div className="flex flex-col justify-between gap-6">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,0,0,0.12)] border border-[rgba(212,0,0,0.25)] text-[#D40000] text-xs font-semibold">
              <TrendingUp className="w-3 h-3" />
              #1 Featured Track
            </span>
          </motion.div>

          {/* Title area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={featured.id + '-info'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <h2
                className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
              >
                {featured.title}
              </h2>
              <p className="text-[#D9D9D9] text-lg font-medium">{featured.artist}</p>
              {featured.album && (
                <p className="text-[#9CA3AF] text-sm">{featured.album}</p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {featured.genre && (
                  <span className="px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] text-xs text-[#9CA3AF] bg-[rgba(255,255,255,0.04)]">
                    {featured.genre}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                  <Headphones className="w-3.5 h-3.5 text-[#D40000]" />
                  {formatPlays(featured.plays)} plays
                </span>
                <span className="text-xs text-[#9CA3AF]">{formatDuration(featured.duration)}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 32px rgba(212,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className="flex items-center gap-3 px-7 py-3.5 bg-[#D40000] text-white font-semibold rounded-2xl hover:bg-[#8B1111] transition-all shadow-lg shadow-[#D40000]/20"
              aria-label={isCurrentlyPlaying ? 'Pause' : `Play ${featured.title}`}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
              {isCurrentlyPlaying ? 'Playing' : 'Play Now'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-6 py-3.5 border border-[rgba(255,255,255,0.15)] text-white font-semibold rounded-2xl glass-effect transition-all text-sm"
              aria-label="Play all featured songs"
            >
              <Music2 className="w-4 h-4" />
              Play All
            </motion.button>
          </div>
        </div>

        {/* Right: Track selector */}
        <div className="flex flex-col gap-2 justify-center">
          {songs.slice(0, 5).map((song, i) => {
            const isActive = i === activeIndex;
            const isThisPlaying = currentTrack?.id === song.id && isPlaying;
            return (
              <motion.button
                key={song.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                onClick={() => {
                  setActiveIndex(i);
                  const storeTrack: StoreTrack = {
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    album: song.album ?? '',
                    duration: song.duration,
                    coverUrl: song.image,
                    audioUrl: song.audioUrl ?? '',
                    genre: song.genre ?? '',
                    plays: song.plays ?? 0,
                    liked: false,
                  };
                  playTrack(storeTrack);
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-[rgba(212,0,0,0.12)] border border-[rgba(212,0,0,0.25)]'
                    : 'hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
                }`}
                aria-label={`Select ${song.title}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                {/* Album art */}
                <div className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden">
                  <Image
                    src={song.image ?? song.coverUrl ?? ''}
                    alt={song.title}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                  {isThisPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex gap-[2px] items-end h-3">
                        {[0, 1, 2].map((j) => (
                          <motion.div
                            key={j}
                            className="w-[2px] bg-[#D40000] rounded-full"
                            animate={{ scaleY: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.6, delay: j * 0.12, repeat: Infinity }}
                            style={{ height: '100%', transformOrigin: 'bottom' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate transition-colors ${
                      isActive ? 'text-[#D40000]' : 'text-white group-hover:text-[#D40000]'
                    }`}
                    style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-[#9CA3AF] truncate">{song.artist}</p>
                </div>

                {/* Duration */}
                <span className="text-xs text-[#9CA3AF] flex-shrink-0 tabular-nums">
                  {formatDuration(song.duration)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedSongBanner;
