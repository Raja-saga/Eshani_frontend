/**
 * HeroSection Component
 * 
 * Main hero section for the landing/home page.
 * Features:
 * - Gradient background
 * - Featured playlist/track display
 * - Call-to-action buttons
 * - Animated content
 * - Responsive design
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Share2 } from 'lucide-react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  featured?: {
    id: string;
    title: string;
    artist: string;
    description: string;
    image: string;
    trackCount?: number;
  };
  onPlayClick?: () => void;
  onLikeClick?: () => void;
  className?: string;
}

/**
 * HeroSection Component
 * 
 * Props:
 * - title: Main heading
 * - subtitle: Subheading
 * - backgroundImage: Background image URL
 * - featured: Featured playlist/track data
 * - onPlayClick: Callback for play button
 * - onLikeClick: Callback for like button
 * - className: Optional CSS classes
 * 
 * Features:
 * - Animated entrance
 * - Gradient overlay
 * - Responsive layout
 * - Call-to-action buttons with animation
 */
const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Discover Music',
  subtitle = 'Your Personal Audio Companion',
  backgroundImage,
  featured = {
    id: '1',
    title: 'Summer Hits 2024',
    artist: 'ESHANI Curated',
    description: 'The hottest tracks of the season',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
    trackCount: 50,
  },
  onPlayClick,
  onLikeClick,
  className = '',
}) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`relative w-full min-h-96 overflow-hidden ${className}`}
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full px-6 py-20 lg:px-12 lg:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Title */}
            <div className="space-y-2">
              <motion.h1
                className="text-4xl lg:text-6xl font-bold leading-tight gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {title}
              </motion.h1>
              <motion.p
                className="text-lg lg:text-xl text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {subtitle}
              </motion.p>
            </div>

            {/* Description */}
            <motion.p
              className="text-base text-foreground/80 max-w-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Immerse yourself in unlimited music, curated playlists, and
              discover your new favorite artists. Join millions of listeners
              worldwide.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPlayClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                <span>Play Now</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all duration-300"
              >
                <span>Explore</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Featured Playlist Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Album Art */}
              <motion.img
                src={featured.image}
                alt={featured.title}
                className="w-full aspect-square object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />

              {/* Overlay on Hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onPlayClick}
                  className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:shadow-lg transition-all"
                >
                  <Play className="w-6 h-6 ml-1" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onLikeClick}
                  className="w-14 h-14 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Heart className="w-6 h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full border-2 border-white text-white flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Share2 className="w-6 h-6" />
                </motion.button>
              </motion.div>

              {/* Card Info */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold line-clamp-2">
                  {featured.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {featured.artist}
                </p>
                <p className="text-sm text-foreground/70">
                  {featured.description}
                </p>
                {featured.trackCount && (
                  <p className="text-xs text-muted-foreground pt-2">
                    {featured.trackCount} songs
                  </p>
                )}
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/20 blur-2xl"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-purple-500/20 blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
