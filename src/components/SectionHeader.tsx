/**
 * SectionHeader Component
 * 
 * Reusable animated section heading with:
 * - Viewport-triggered fade + slide animation
 * - Title + subtitle
 * - Optional "See All" link
 * - Red accent line decoration
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  accentLine?: boolean;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel = 'See All',
  accentLine = true,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`flex items-end justify-between mb-8 lg:mb-10 ${className}`}
    >
      <div className="space-y-2">
        {/* Accent Line */}
        {accentLine && (
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="h-0.5 w-10 bg-[#D40000] origin-left rounded-full"
          />
        )}

        {/* Title */}
        <h2 className="text-[1.875rem] lg:text-[2.25rem] font-bold text-[#FFFFFF] leading-tight tracking-tight" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[0.9375rem] text-[#9CA3AF] font-normal leading-relaxed" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* See All Link */}
      {seeAllHref && (
        <motion.a
          href={seeAllHref}
          whileHover={{ x: 4 }}
          className="flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] hover:text-[#D40000] transition-colors duration-200 flex-shrink-0 ml-4 pb-1"
          aria-label={`${seeAllLabel} — ${title}`}
        >
          <span>{seeAllLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.a>
      )}
    </motion.div>
  );
};

export default SectionHeader;
