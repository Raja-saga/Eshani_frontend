/**
 * PremiumHeroSection Component
 *
 * Cinematic split-screen hero with:
 * - Left: Headline, subtitle, CTAs, stats
 * - Right: Artist artwork, floating album cards, animated glow
 * - Mouse parallax using Framer Motion springs
 * - Animated waveform
 * - Scroll indicator
 */

'use client';

import React, { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { Play, Music, TrendingUp, Users, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { ESHANI_PHOTOS } from '@/data/mockData';

const yt = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

interface FloatingCardData {
  id: string;
  image: string;
  title: string;
  artist: string;
  posX: string;
  posY: string;
  delay: number;
  parallaxX: number;
  parallaxY: number;
  floatDuration: number;
}

const FLOATING_CARDS: FloatingCardData[] = [
  {
    id: 'fc-1',
    image: yt('bKucvURJtaY'),
    title: 'SWAY',
    artist: 'ESHANI',
    posX: '-8%',
    posY: '12%',
    delay: 0,
    parallaxX: 7,
    parallaxY: 5,
    floatDuration: 3.8,
  },
  {
    id: 'fc-2',
    image: yt('lYHg4gDwlpA'),
    title: 'FREAK',
    artist: 'ESHANI',
    posX: '80%',
    posY: '8%',
    delay: 0.3,
    parallaxX: -5,
    parallaxY: -4,
    floatDuration: 4.2,
  },
  {
    id: 'fc-3',
    image: yt('Prbcd-J2Mjg'),
    title: 'Freedom',
    artist: 'ESHANI',
    posX: '-12%',
    posY: '72%',
    delay: 0.6,
    parallaxX: 9,
    parallaxY: 7,
    floatDuration: 3.4,
  },
  {
    id: 'fc-4',
    image: yt('bHNkcv5st6c'),
    title: 'Not Your Typical Brown Girl',
    artist: 'ESHANI',
    posX: '78%',
    posY: '75%',
    delay: 0.15,
    parallaxX: -6,
    parallaxY: -5,
    floatDuration: 5.0,
  },
];

const STATS = [
  { label: 'Tracks Released', value: '50+', icon: Music },
  { label: 'Monthly Listeners', value: '2M+', icon: TrendingUp },
  { label: 'Years Active', value: '8+', icon: Users },
];

// Animated waveform
const AnimatedWaveform: React.FC<{ className?: string }> = ({ className = '' }) => {
  const bars = Array.from({ length: 28 });
  return (
    <div className={`flex items-end gap-[2px] ${className}`} aria-hidden="true">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-[#D40000]"
          animate={{
            scaleY: [0.3, 0.7 + (i % 4) * 0.07, 0.3],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 0.7 + (i % 5) * 0.12,
            delay: i * 0.04,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ height: '32px', transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  );
};

// Floating card that uses pre-computed motion values
const FloatingCard: React.FC<{
  card: FloatingCardData;
  translateX: MotionValue<number>;
  translateY: MotionValue<number>;
}> = ({ card, translateX, translateY }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.4 + card.delay }}
    style={{
      position: 'absolute',
      left: card.posX,
      top: card.posY,
      x: translateX,
      y: translateY,
    }}
    className="hidden lg:block"
    aria-hidden="true"
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: card.floatDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="w-[100px] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.12)] shadow-2xl shadow-black/40 glass-effect"
    >
      <div className="relative w-full aspect-square">
        <Image src={card.image} alt={card.title} fill className="object-cover" sizes="100px" />
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-semibold text-white truncate">{card.title}</p>
        <p className="text-[9px] text-[#9CA3AF] truncate">{card.artist}</p>
      </div>
    </motion.div>
  </motion.div>
);

interface PremiumHeroProps {
  onPlayClick?: () => void;
}

// Pre-compute all 4 card motion value pairs at top level (not in loop)
const useCardParallax = (
  springX: ReturnType<typeof useSpring>,
  springY: ReturnType<typeof useSpring>,
  pX: number,
  pY: number
) => {
  const tx = useTransform(springX, [-0.5, 0.5], [-pX, pX]);
  const ty = useTransform(springY, [-0.5, 0.5], [-pY, pY]);
  return [tx, ty] as const;
};

const PremiumHeroSection: React.FC<PremiumHeroProps> = ({
  onPlayClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // Artwork parallax
  const artworkX = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const artworkY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

  // Card 1
  const [c1x, c1y] = useCardParallax(springX, springY, FLOATING_CARDS[0].parallaxX, FLOATING_CARDS[0].parallaxY);
  // Card 2
  const [c2x, c2y] = useCardParallax(springX, springY, FLOATING_CARDS[1].parallaxX, FLOATING_CARDS[1].parallaxY);
  // Card 3
  const [c3x, c3y] = useCardParallax(springX, springY, FLOATING_CARDS[2].parallaxX, FLOATING_CARDS[2].parallaxY);
  // Card 4
  const [c4x, c4y] = useCardParallax(springX, springY, FLOATING_CARDS[3].parallaxX, FLOATING_CARDS[3].parallaxY);

  const cardTransforms = [[c1x, c1y], [c2x, c2y], [c3x, c3y], [c4x, c4y]] as const;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen overflow-hidden bg-[#000000] flex items-center"
      aria-label="Hero — ESHANI Music Platform"
    >
      {/* Background glow left */}
      <motion.div
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-48 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,0,0,0.18) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Background glow right */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,0,0,0.2) 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container-premium relative z-10 w-full pt-24 pb-20 lg:pt-8 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center min-h-[85vh]">

          {/* LEFT: Text */}
          <div className="flex flex-col justify-center order-2 lg:order-1">

            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-7"
            >
              <span className="badge-primary">
                <Music className="w-3.5 h-3.5" aria-hidden="true" />
                Official Music Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[#FFFFFF] mb-6"
              style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
            >
              Music Without{' '}
              <span className="gradient-text">Limits</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[#D9D9D9] leading-relaxed mb-4 max-w-lg"
            >
              Stream every track from ESHANI — direct, unfiltered, and always authentic.
              No gatekeepers. Pure music.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mb-9"
            >
              <AnimatedWaveform />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-14"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(212,0,0,0.45)' }}
                whileTap={{ scale: 0.96 }}
                onClick={onPlayClick}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#D40000] text-white font-semibold rounded-2xl hover:bg-[#8B1111] transition-all duration-200 text-base"
                aria-label="Start streaming music"
              >
                <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                Start Listening
              </motion.button>

              <motion.a
                href="https://www.instagram.com/eshanimusic/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-[rgba(255,255,255,0.15)] text-[#FFFFFF] font-semibold rounded-2xl transition-all duration-200 glass-effect text-base"
                aria-label="Follow ESHANI on Instagram">
                Connect ESHANI
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-row gap-8 pt-8 border-t border-[rgba(255,255,255,0.08)]"
            >
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.1 }}
                    className="flex flex-col gap-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#D40000]" aria-hidden="true" />
                      <span
                        className="text-2xl font-bold text-[#FFFFFF]"
                        style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                      >
                        {stat.value}
                      </span>
                    </div>
                    <span className="text-xs text-[#9CA3AF]">{stat.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* RIGHT: Artist Artwork */}
          <div className="relative flex items-center justify-center order-1 lg:order-2 h-[420px] lg:h-auto">

            {/* Artist Image with parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              style={{ x: artworkX, y: artworkY }}
              className="relative z-10"
            >
              {/* Glow */}
              <div
                className="absolute -inset-4 rounded-3xl opacity-60 blur-2xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(212,0,0,0.35) 0%, transparent 70%)' }}
                aria-hidden="true"
              />

              {/* Image frame */}
              <div className="relative w-[280px] h-[360px] sm:w-[320px] sm:h-[410px] lg:w-[360px] lg:h-[460px] xl:w-[400px] xl:h-[500px] rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
                <Image
                  src={ESHANI_PHOTOS.hero}
                  alt="ESHANI"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Now Playing badge */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-5 left-4 right-4 flex items-center gap-3 px-4 py-3 rounded-2xl glass-effect border border-[rgba(255,255,255,0.1)]"
                  aria-label="Now playing: SWAY by ESHANI"
                >
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={yt('bKucvURJtaY')}
                      alt="SWAY"
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">SWAY</p>
                    <p className="text-[10px] text-[#9CA3AF]">ESHANI</p>
                  </div>
                  <div className="flex gap-[2px] items-end h-4 flex-shrink-0" aria-hidden="true">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] bg-[#D40000] rounded-full"
                        animate={{ scaleY: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                        style={{ height: '100%', transformOrigin: 'bottom' }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Album Cards — each with pre-computed transforms */}
            {FLOATING_CARDS.map((card, i) => (
              <FloatingCard
                key={card.id}
                card={card}
                translateX={cardTransforms[i][0]}
                translateY={cardTransforms[i][1]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#9CA3AF]"
        aria-hidden="true"
      >
        <span className="text-[10px] font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
};

export default PremiumHeroSection;
