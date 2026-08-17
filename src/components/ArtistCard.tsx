/**
 * ArtistCard Component
 *
 * Premium card for artist profiles.
 * Features:
 * - Full-bleed image with gradient overlay
 * - Verified badge
 * - Follower count
 * - Play & Follow actions on hover
 * - Smooth animations
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, UserPlus, UserCheck, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import { Artist } from '@/data/mockData';

interface ArtistCardProps {
  artist: Artist;
  onPlay?: () => void;
  onFollow?: () => void;
  following?: boolean;
  index?: number;
}

const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  onPlay,
  onFollow,
  following = false,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFollowing, setIsFollowing] = useState(following);

  const formatFollowers = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    onFollow?.();
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
      role="article"
      aria-label={`Artist: ${artist.name}`}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl mb-4 bg-[#181818]">
        <Image
          src={artist.image}
          alt={`${artist.name} profile photo`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Gradient overlay — always visible at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Genre tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-[#D9D9D9] border border-[rgba(255,255,255,0.1)]">
            {artist.genre}
          </span>
        </div>

        {/* Hover actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center gap-3"
        >
          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            className="play-button shadow-xl shadow-black/40"
            aria-label={`Play ${artist.name}`}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </motion.button>

          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2, delay: 0.04 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFollow}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 ${
              isFollowing
                ? 'bg-[#D40000] text-white shadow-lg shadow-[#D40000]/30'
                : 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25'
            }`}
            aria-label={isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
          >
            {isFollowing ? (
              <UserCheck className="w-5 h-5" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
          </motion.button>
        </motion.div>

        {/* Bottom info — always visible */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
              {artist.name}
            </p>
            {artist.verified && (
              <BadgeCheck className="w-3.5 h-3.5 text-[#D40000] flex-shrink-0" aria-label="Verified artist" />
            )}
          </div>
          <p className="text-xs text-[#9CA3AF]">
            {formatFollowers(artist.followers)} followers
          </p>
        </div>
      </div>

      {/* Follow button below card */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleFollow}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          isFollowing
            ? 'bg-[rgba(212,0,0,0.12)] text-[#D40000] border border-[rgba(212,0,0,0.25)] hover:bg-[rgba(212,0,0,0.18)]'
            : 'bg-[rgba(255,255,255,0.06)] text-[#D9D9D9] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
        }`}
        aria-label={isFollowing ? `Unfollow ${artist.name}` : `Follow ${artist.name}`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </motion.button>
    </motion.div>
  );
};

export default ArtistCard;
