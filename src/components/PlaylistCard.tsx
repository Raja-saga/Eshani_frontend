/**
 * PlaylistCard Component
 * 
 * Dedicated card for playlists.
 * Features:
 * - Cover image with gradient overlay
 * - Track count pill
 * - Curator attribution
 * - Mood indicator
 * - Smooth hover reveal play button
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Music2 } from 'lucide-react';
import Image from 'next/image';
import { Playlist } from '@/data/mockData';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay?: () => void;
  index?: number;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onPlay,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
      onClick={onPlay}
      role="button"
      tabIndex={0}
      aria-label={`Play playlist: ${playlist.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onPlay?.()}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl mb-4 bg-[#181818]">
        <Image
          src={playlist.image}
          alt={playlist.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Track Count Badge */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-[rgba(255,255,255,0.12)]">
            <Music2 className="w-3 h-3 text-[#D40000]" />
            <span className="text-xs font-medium text-[#FFFFFF]">
              {playlist.trackCount} songs
            </span>
          </div>
        </div>

        {/* Mood Tag */}
        {playlist.mood && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-[#D40000]/90 text-white text-xs font-medium backdrop-blur-sm">
              {playlist.mood}
            </span>
          </div>
        )}

        {/* Play Button Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className="w-14 h-14 rounded-full bg-[#D40000] text-white flex items-center justify-center shadow-xl shadow-black/40"
            aria-label={`Play ${playlist.title}`}
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </motion.button>
        </motion.div>

        {/* Bottom gradient info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-xs text-[#D9D9D9]/80 font-medium">
            {playlist.curator}
          </div>
        </div>
      </div>

      {/* Text Info */}
      <div className="px-1 space-y-1">
        <h4
          className="font-semibold text-[#FFFFFF] text-[0.9375rem] line-clamp-1 group-hover:text-[#D40000] transition-colors duration-200"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          {playlist.title}
        </h4>
        <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
          {playlist.description}
        </p>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;
