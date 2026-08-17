/**
 * SkeletonCard Component
 * 
 * Reusable skeleton loader with shimmer animation.
 * Supports album, artist, and song row variants.
 */

'use client';

import React from 'react';

interface SkeletonCardProps {
  variant?: 'album' | 'artist' | 'row' | 'playlist';
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'album',
  className = '',
}) => {
  if (variant === 'row') {
    return (
      <div className={`flex items-center gap-4 px-4 py-3 ${className}`}>
        <div className="skeleton w-8 h-4 rounded flex-shrink-0" />
        <div className="skeleton w-11 h-11 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 rounded w-3/4" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
        <div className="skeleton h-3 w-10 rounded hidden md:block" />
        <div className="skeleton h-3 w-8 rounded" />
      </div>
    );
  }

  if (variant === 'artist') {
    return (
      <div className={`premium-card space-y-4 ${className}`}>
        <div className="skeleton aspect-square rounded-xl w-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 rounded w-3/4 mx-auto" />
          <div className="skeleton h-3 rounded w-1/2 mx-auto" />
        </div>
        <div className="skeleton h-9 rounded-lg w-full" />
      </div>
    );
  }

  if (variant === 'playlist') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="skeleton aspect-square rounded-2xl w-full" />
        <div className="space-y-2 px-1">
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-3 rounded w-full" />
          <div className="skeleton h-3 rounded w-2/3" />
        </div>
      </div>
    );
  }

  // Default: album
  return (
    <div className={`premium-card space-y-4 ${className}`}>
      <div className="skeleton aspect-square rounded-xl w-full" />
      <div className="space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/2" />
      </div>
    </div>
  );
};

export default SkeletonCard;
