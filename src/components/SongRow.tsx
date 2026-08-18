'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, Plus, Check, ListMusic, Crown } from 'lucide-react';
import Image from 'next/image';
import { Track } from '@/data/mockData';
import { formatDuration } from '@/utils/helpers';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import useSubscriptionStore from '@/store/subscriptionStore';
import { Track as StoreTrack } from '@/types';

interface SongRowProps {
  track: Track;
  index: number;
  onLike?: () => void;
  liked?: boolean;
}

const SongRow: React.FC<SongRowProps> = ({ track, index, onLike, liked = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addedTo, setAddedTo] = useState<string | null>(null);
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { currentTrack, isPlaying, playTrack, setIsPlaying } = usePlayerStore();
  const { localPlaylists, addSongToPlaylist } = useLibraryStore();
  const { isPremium } = useSubscriptionStore();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isThisPlaying = isCurrentTrack && isPlaying;

  useEffect(() => {
    if (!showPlaylistMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlaylistMenu]);

  const handlePlay = () => {
    if (track.isPremium && !isPremium) {
      setPremiumBlocked(true);
      setTimeout(() => {
        setPremiumBlocked(false);
        router.push('/subscribe');
      }, 1800);
      return;
    }

    if (isCurrentTrack) {
      setIsPlaying(!isPlaying);
    } else {
      const storeTrack: StoreTrack = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album ?? '',
        duration: track.duration,
        image: track.image,
        coverUrl: track.image,
        audioUrl: track.audioUrl ?? '',
        genre: track.genre ?? '',
        plays: track.plays ?? 0,
        liked,
        youtubeId: track.youtubeId,
        isPremium: track.isPremium,
      };
      playTrack(storeTrack);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.();
  };

  const handleAddToPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    addSongToPlaylist(playlistId, track.id);
    setAddedTo(playlistId);
    setTimeout(() => { setAddedTo(null); setShowPlaylistMenu(false); }, 900);
  };

  const formatPlays = (plays?: number) => {
    if (!plays) return '';
    if (plays >= 1_000_000) return (plays / 1_000_000).toFixed(1) + 'M';
    if (plays >= 1_000) return (plays / 1_000).toFixed(0) + 'K';
    return plays.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
      className="group relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
      style={{ background: isHovered ? 'rgba(255,255,255,0.05)' : 'transparent' }}
      role="button"
      tabIndex={0}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
      onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
    >
      {/* Premium gate overlay */}
      <AnimatePresence>
        {premiumBlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 rounded-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-[#D40000] rounded-xl shadow-lg">
              <Crown className="w-3.5 h-3.5 text-white flex-shrink-0" />
              <p className="text-xs text-white font-semibold">Premium only — redirecting to subscribe...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track Number / Play Icon */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        {isHovered || isCurrentTrack ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.15 }}>
            {isThisPlaying ? (
              <Pause className="w-4 h-4 text-[#D40000]" />
            ) : (
              <Play className="w-4 h-4 text-[#FFFFFF] fill-current" />
            )}
          </motion.div>
        ) : (
          <span className="text-sm font-medium tabular-nums text-[#9CA3AF]">{index + 1}</span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden bg-[#181818]">
        <Image src={track.image} alt={track.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="44px" />
        {isThisPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex gap-[2px] items-end h-4">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-[3px] bg-[#D40000] rounded-full"
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                  style={{ height: '100%', transformOrigin: 'bottom' }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate transition-colors ${isCurrentTrack ? 'text-[#D40000]' : 'text-[#FFFFFF]'}`}>
          {track.title}
          {track.isPremium && (
            <span className="ml-2 text-[9px] font-bold bg-[#D40000] text-white px-1.5 py-0.5 rounded-full align-middle">PREMIUM</span>
          )}
        </p>
        <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{track.artist}</p>
      </div>

      {/* Genre */}
      {track.genre && (
        <div className="hidden md:block flex-shrink-0">
          <span className="text-xs text-[#9CA3AF] px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]">
            {track.genre}
          </span>
        </div>
      )}

      {/* Plays */}
      {track.plays && (
        <div className="hidden lg:block flex-shrink-0 w-16 text-right">
          <span className="text-xs text-[#9CA3AF] tabular-nums">{formatPlays(track.plays)}</span>
        </div>
      )}

      {/* Like — suppressHydrationWarning prevents server/client Zustand mismatch */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLike}
        className={`flex-shrink-0 p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 ${liked ? 'text-[#D40000]' : 'text-[#9CA3AF] hover:text-[#FFFFFF]'}`}
        aria-label={liked ? 'Unlike' : 'Like'}
        suppressHydrationWarning
      >
        <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} suppressHydrationWarning />
      </motion.button>

      {/* Add to Playlist */}
      {localPlaylists.length > 0 && (
        <div className="relative flex-shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(!showPlaylistMenu); }}
            className="p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 text-[#9CA3AF] hover:text-white"
            aria-label="Add to playlist"
          >
            <Plus className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showPlaylistMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-8 right-0 z-50 min-w-[180px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.12)] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.07)]">
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Add to Playlist</p>
                </div>
                {localPlaylists.map((pl) => {
                  const inList = pl.songIds.includes(track.id);
                  const justAdded = addedTo === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={(e) => !inList && handleAddToPlaylist(e, pl.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${inList ? 'text-[#D40000] cursor-default' : 'text-white hover:bg-[rgba(255,255,255,0.07)] cursor-pointer'}`}
                    >
                      {justAdded ? (
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      ) : inList ? (
                        <Check className="w-3.5 h-3.5 text-[#D40000] flex-shrink-0" />
                      ) : (
                        <ListMusic className="w-3.5 h-3.5 flex-shrink-0 text-[#9CA3AF]" />
                      )}
                      <span className="truncate">{pl.name}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Duration */}
      <div className="flex-shrink-0 w-10 text-right">
        <span className="text-xs text-[#9CA3AF] tabular-nums">{formatDuration(track.duration)}</span>
      </div>
    </motion.div>
  );
};

export default SongRow;
