/**
 * Carousel Component
 *
 * Smooth, premium horizontal carousel.
 * - Fixed scroll arrow buttons
 * - Gradient edge fade
 * - Touch/swipe support
 * - Responsive card widths
 */

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode;
  gap?: number;
  cardMinWidth?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  gap = 20,
  cardMinWidth = 200,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Also re-check when children change
  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [children, checkScroll]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  const childArray = React.Children.toArray(children);

  return (
    <div className="relative group/carousel">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none z-10 transition-opacity duration-200"
        style={{
          background: 'linear-gradient(to right, #000000 0%, transparent 100%)',
          opacity: canScrollLeft ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none z-10 transition-opacity duration-200"
        style={{
          background: 'linear-gradient(to left, #000000 0%, transparent 100%)',
          opacity: canScrollRight ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Left Arrow */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#181818] border border-[rgba(255,255,255,0.1)] text-white flex items-center justify-center shadow-xl transition-all duration-200 ${
          canScrollLeft
            ? 'opacity-100 hover:bg-[#222] hover:border-[rgba(255,255,255,0.2)]'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>

      {/* Right Arrow */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#181818] border border-[rgba(255,255,255,0.1)] text-white flex items-center justify-center shadow-xl transition-all duration-200 ${
          canScrollRight
            ? 'opacity-100 hover:bg-[#222] hover:border-[rgba(255,255,255,0.2)]'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-3 px-1 scrollbar-hide"
        style={{
          gap: `${gap}px`,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
        onScroll={checkScroll}
      >
        {childArray.map((child, i) => (
          <div
            key={i}
            className="flex-shrink-0"
            style={{
              scrollSnapAlign: 'start',
              width: `min(${cardMinWidth}px, calc(50% - ${gap / 2}px))`,
              minWidth: `${cardMinWidth}px`,
              maxWidth: '240px',
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
