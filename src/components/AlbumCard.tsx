/**
 * AlbumCard Component
 *
 * Premium card for albums, tracks, and upcoming releases.
 * Clicking play wires to the Zustand playerStore.
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import { formatDuration } from '@/utils/helpers';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import { Track as StoreTrack } from '@/types';

interface AlbumCardProps {
  id: string;
  title: string;
  artist?: string;
  image: string;
  trackCount?: number;
  duration?: number;
  audioUrl?: string;
  onPlay?: () => void;
  onLike?: () => void;
  liked?: boolean;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary' | 'success';
  releaseDate?: string;
  index?: number;
}

const BADGE_STYLES: Record<string, string> = {
  primary: 'bg-[rgba(212,0,0,0.85)] text-white',
  secondary: 'bg-[rgba(255,255,255,0.15)] text-white border border-[rgba(255,255,255,0.2)]',
  success: 'bg-[rgba(34,197,94,0.85)] text-white',
};

const AlbumCard: React.FC<AlbumCardProps> = ({
  id,
  title,
  artist = 'Unknown Artist',
  image,
  trackCount,
  duration,
  audioUrl,
  onPlay,
  onLike,
  liked = false,
  badge,
  badgeVariant = 'primary',
  releaseDate,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const { playTrack } = usePlayerStore();
  const { toggleSaveAlbum, isAlbumSaved } = useLibraryStore();
  const isLiked = isAlbumSaved(id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Build a StoreTrack-compatible object from props
    const storeTrack: StoreTrack = {
      id,
      title,
      artist,
      album: '',
      duration: duration ?? 0,
      coverUrl: image,
      audioUrl: audioUrl ?? '',
      genre: '',
      plays: 0,
      liked: isLiked,
    };
    playTrack(storeTrack);
    onPlay?.();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveAlbum(id);
    onLike?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
      role="article"
      aria-label={`${title}${artist ? ` by ${artist}` : ''}`}
    >
      {/* Image Container */}
      <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-[#181818]">
        <Image
          src={image}
          alt={`${title} album artwork`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
              BADGE_STYLES[badgeVariant] ?? BADGE_STYLES.primary
            }`}
          >
            {badge}
          </div>
        )}

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex items-end justify-between p-4"
        >
          {/* Play Button */}
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: isHovered ? 0.05 : 0 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={handlePlay}
            className="play-button shadow-xl shadow-black/40"
            aria-label={`Play ${title}`}
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </motion.button>

          {/* Like Button */}
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: isHovered ? 0.08 : 0 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleLike}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
              isLiked
                ? 'bg-[#D40000] text-white shadow-lg shadow-[#D40000]/30'
                : 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
            }`}
            aria-label={isLiked ? `Unlike ${title}` : `Like ${title}`}
          >
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
          </motion.button>
        </motion.div>

        {/* Duration pill */}
        {duration && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
              <Clock className="w-2.5 h-2.5 text-[#9CA3AF]" />
              <span className="text-[10px] text-[#9CA3AF]">{formatDuration(duration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-1 px-1">
        <h4
          className="font-semibold text-[0.9375rem] text-[#FFFFFF] line-clamp-1 group-hover:text-[#D40000] transition-colors duration-200"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          {title}
        </h4>
        {artist && (
          <p className="text-sm text-[#9CA3AF] line-clamp-1">{artist}</p>
        )}
        <div className="flex items-center gap-3">
          {trackCount && (
            <span className="text-xs text-[#9CA3AF]">{trackCount} songs</span>
          )}
          {releaseDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#9CA3AF]" />
              <span className="text-xs text-[#9CA3AF]">{releaseDate}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AlbumCard;
