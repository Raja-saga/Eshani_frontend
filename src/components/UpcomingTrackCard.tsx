/**
 * UpcomingTrackCard Component
 *
 * Premium card for upcoming/pre-order releases.
 * - Countdown-style release date badge
 * - Pre-order button
 * - Bell notification
 * - Pre-order count
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import Image from 'next/image';
import { UpcomingRelease } from '@/data/mockData';

interface UpcomingTrackCardProps {
  release: UpcomingRelease;
  index?: number;
}

const UpcomingTrackCard: React.FC<UpcomingTrackCardProps> = ({ release, index = 0 }) => {
  const formatPreOrders = (count?: number) => {
    if (!count) return '0';
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(0) + 'K';
    return count.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className="group cursor-pointer"
      role="article"
      aria-label={`${release.title} by ${release.artist}, releasing ${release.releaseDate}`}
    >
      {/* Image Container */}
      <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-[#181818]">
        <Image
          src={release.image}
          alt={`${release.title} upcoming release artwork`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Coming Soon Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[rgba(212,0,0,0.85)] text-white backdrop-blur-sm">
          Coming Soon
        </div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Metadata */}
      <div className="space-y-2 px-1">
        <h4
          className="font-semibold text-[0.9375rem] text-[#FFFFFF] line-clamp-1 group-hover:text-[#D40000] transition-colors duration-200"
          style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
        >
          {release.title}
        </h4>
        <p className="text-sm text-[#9CA3AF] line-clamp-1">{release.artist}</p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#D40000]" />
            <span className="text-xs text-[#D40000] font-medium">{release.releaseDate}</span>
          </div>
          {release.preOrders && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#9CA3AF]" />
              <span className="text-xs text-[#9CA3AF]">{formatPreOrders(release.preOrders)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UpcomingTrackCard;
