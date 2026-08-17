'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  RotateCcw, Shuffle, ChevronDown, ChevronUp, Heart, ListMusic, Repeat1,
} from 'lucide-react';
import Image from 'next/image';
import usePlayerStore from '@/store/playerStore';
import useLibraryStore from '@/store/libraryStore';
import { formatDuration } from '@/utils/helpers';

const WaveformBars: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <div className="flex items-end gap-[2px] h-5" aria-hidden="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <motion.div key={i} className="w-[2.5px] bg-[#D40000] rounded-full"
        animate={isPlaying ? { scaleY: [0.3, 1, 0.4, 0.9, 0.3], opacity: [0.5, 1, 0.7, 1, 0.5] } : { scaleY: 0.3, opacity: 0.3 }}
        transition={{ duration: 0.9 + i * 0.12, delay: i * 0.08, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
        style={{ height: '100%', transformOrigin: 'bottom' }} />
    ))}
  </div>
);

const Slider: React.FC<{
  value: number; min?: number; max: number; step?: number;
  onChange: (val: number) => void; accent?: boolean; ariaLabel: string; className?: string;
}> = ({ value, min = 0, max, step = 0.01, onChange, accent = false, ariaLabel, className = '' }) => {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={`relative flex items-center ${className}`} style={{ height: '20px' }}>
      <div className="absolute inset-y-0 flex items-center w-full">
        <div className="relative w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.1)]">
          <div className={`absolute left-0 top-0 h-full rounded-full transition-none ${accent ? 'bg-[#D40000]' : 'bg-[rgba(255,255,255,0.55)]'}`}
            style={{ width: `${Math.min(100, percent)}%` }} />
          <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md transition-none ${accent ? 'bg-[#D40000]' : 'bg-white'} opacity-0 group-hover/slider:opacity-100`}
            style={{ left: `calc(${Math.min(100, percent)}% - 6px)` }} />
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer" aria-label={ariaLabel} style={{ zIndex: 10 }} />
    </div>
  );
};

const AudioPlayer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);

  const ytPlayerRef = useRef<any>(null);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ytReady, setYtReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    currentTrack, isPlaying, currentTime, volume, repeat, shuffle,
    setIsPlaying, setCurrentTime, nextTrack, previousTrack, setRepeat, toggleShuffle, setVolume,
  } = usePlayerStore();

  const { toggleLike, isLiked, addToRecentlyPlayed } = useLibraryStore();
  const liked = currentTrack ? isLiked(currentTrack.id) : false;
  const isYouTubeTrack = !!currentTrack?.youtubeId;
  const effectiveVolume = isMuted ? 0 : volume;

  // Load YouTube IFrame API once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).YT?.Player) { setYtReady(true); return; }
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => { prev?.(); setYtReady(true); };
    if (!document.getElementById('yt-iframe-api')) {
      const s = document.createElement('script');
      s.id = 'yt-iframe-api';
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }, []);

  // Global spacebar play/pause
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.code !== 'Space') return;
      e.preventDefault();
      const store = usePlayerStore.getState();
      if (store.currentTrack) store.setIsPlaying(!store.isPlaying);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Create / switch YouTube player whenever track ID changes
  useEffect(() => {
    const ytId = currentTrack?.youtubeId;
    if (!ytReady || !ytId) return;

    const shouldPlay = usePlayerStore.getState().isPlaying;
    if (ytPlayerRef.current?.loadVideoById) {
      try {
        if (shouldPlay) {
          ytPlayerRef.current.loadVideoById(ytId);
        } else {
          ytPlayerRef.current.cueVideoById(ytId);
        }
      } catch {}
      return;
    }

    if (!document.getElementById('yt-player-hidden')) {
      const el = document.createElement('div');
      el.id = 'yt-player-hidden';
      el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
      document.body.appendChild(el);
    }

    ytPlayerRef.current = new (window as any).YT.Player('yt-player-hidden', {
      videoId: ytId,
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, rel: 0, fs: 0, modestbranding: 1 },
      events: {
        onReady: (e: any) => {
          e.target.setVolume(usePlayerStore.getState().volume * 100);
          if (usePlayerStore.getState().isPlaying) e.target.playVideo();
        },
        onStateChange: (e: any) => {
          const States = (window as any).YT?.PlayerState;
          if (!States) return;
          const store = usePlayerStore.getState();
          if (e.data === States.PLAYING) store.setIsPlaying(true);
          else if (e.data === States.PAUSED) store.setIsPlaying(false);
          else if (e.data === States.ENDED) store.nextTrack();
        },
      },
    });
  }, [ytReady, currentTrack?.id]); // eslint-disable-line

  // Play / pause
  useEffect(() => {
    if (isYouTubeTrack) {
      try {
        if (isPlaying) ytPlayerRef.current?.playVideo?.();
        else ytPlayerRef.current?.pauseVideo?.();
      } catch {}
    } else {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) audio.play().catch(() => setIsPlaying(false));
      else audio.pause();
    }
  }, [isPlaying, isYouTubeTrack, setIsPlaying]);

  // HTML5 audio src sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || currentTrack.youtubeId) return;
    audio.src = currentTrack.audioUrl ?? '';
    audio.load();
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack?.id]); // eslint-disable-line

  // Volume sync
  useEffect(() => {
    const eff = isMuted ? 0 : Math.max(0, Math.min(1, volume));
    if (isYouTubeTrack) {
      try { ytPlayerRef.current?.setVolume?.(eff * 100); } catch {}
    } else if (audioRef.current) {
      audioRef.current.volume = eff;
    }
  }, [volume, isMuted, isYouTubeTrack]);

  // Poll YouTube time
  useEffect(() => {
    if (ytIntervalRef.current) { clearInterval(ytIntervalRef.current); ytIntervalRef.current = null; }
    if (!isYouTubeTrack || !isPlaying) return;
    ytIntervalRef.current = setInterval(() => {
      try { setCurrentTime(ytPlayerRef.current?.getCurrentTime?.() ?? 0); } catch {}
    }, 500);
    return () => { if (ytIntervalRef.current) clearInterval(ytIntervalRef.current); };
  }, [isYouTubeTrack, isPlaying, setCurrentTime]);

  // Track recently played
  useEffect(() => {
    if (currentTrack?.id && isPlaying) addToRecentlyPlayed(currentTrack.id);
  }, [currentTrack?.id]); // eslint-disable-line

  const handleSeek = useCallback((val: number) => {
    setCurrentTime(val);
    if (isYouTubeTrack) { try { ytPlayerRef.current?.seekTo?.(val, true); } catch {} }
    else if (audioRef.current) { audioRef.current.currentTime = val; }
  }, [setCurrentTime, isYouTubeTrack]);

  const handleVolumeChange = useCallback((val: number) => {
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
  }, [setVolume, isMuted]);

  const handleMuteToggle = useCallback(() => {
    if (!isMuted) { setPrevVolume(volume); setIsMuted(true); }
    else { setIsMuted(false); if (volume === 0) setVolume(prevVolume || 0.7); }
  }, [isMuted, volume, prevVolume, setVolume]);

  const handleRepeat = useCallback(() => {
    const next = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
    setRepeat(next as 'off' | 'all' | 'one');
  }, [repeat, setRepeat]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  }, [setCurrentTime]);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
    } else { nextTrack(); }
  }, [repeat, nextTrack]);

  const progressPercent = currentTrack?.duration
    ? Math.min(100, (currentTime / currentTrack.duration) * 100) : 0;

  // No track — render nothing (no idle bar)
  if (!currentTrack) return null;

  return (
    <>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} aria-hidden="true" preload="metadata" />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0a0a0a' }}
            role="dialog" aria-modal="true" aria-label="Now Playing"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <Image src={currentTrack.image} alt="" fill className="object-cover opacity-[0.12] scale-110 blur-3xl" sizes="100vw" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
            </div>

            <div className="relative z-10 flex justify-between items-center px-6 pt-6 pb-3">
              <button onClick={() => setIsExpanded(false)} className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors" aria-label="Close">
                <ChevronDown className="w-5 h-5" />
                <span className="text-sm font-medium">Now Playing</span>
              </button>
              <button className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all" aria-label="Queue">
                <ListMusic className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 gap-7 pb-10">
              <motion.div layoutId="player-album-art" className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                <Image src={currentTrack.image} alt={`${currentTrack.title} cover`} width={288} height={288} className="w-full h-full object-cover" priority />
              </motion.div>

              <div className="text-center space-y-2 w-full max-w-sm">
                <div className="flex items-center justify-center gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-white truncate" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>{currentTrack.title}</h2>
                    <p className="text-[#9CA3AF] text-sm mt-0.5">{currentTrack.artist}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    onClick={() => currentTrack && toggleLike(currentTrack.id)} className="flex-shrink-0"
                    aria-label={liked ? 'Unlike' : 'Like'}>
                    <Heart className={`w-6 h-6 transition-colors ${liked ? 'text-[#D40000] fill-current' : 'text-[#9CA3AF]'}`} />
                  </motion.button>
                </div>
                {isYouTubeTrack && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#9CA3AF] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded-full">
                    ▶ YouTube
                  </span>
                )}
              </div>

              <div className="w-full max-w-sm space-y-1 group/slider">
                <Slider value={currentTime} max={currentTrack.duration || 1} step={0.1} onChange={handleSeek} accent ariaLabel="Track progress" />
                <div className="flex justify-between text-xs text-[#9CA3AF] px-0.5">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(currentTrack.duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleShuffle}
                  className={`p-2 rounded-xl transition-colors ${shuffle ? 'text-[#D40000]' : 'text-[#9CA3AF] hover:text-white'}`} aria-label="Shuffle">
                  <Shuffle className="w-5 h-5" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={previousTrack}
                  className="p-2 text-[#D9D9D9] hover:text-white transition-colors" aria-label="Previous">
                  <SkipBack className="w-7 h-7" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-[#D40000] flex items-center justify-center shadow-xl shadow-[#D40000]/40 hover:bg-[#8B1111] transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? <Pause className="w-7 h-7 fill-current text-white" /> : <Play className="w-7 h-7 fill-current text-white ml-0.5" />}
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextTrack}
                  className="p-2 text-[#D9D9D9] hover:text-white transition-colors" aria-label="Next">
                  <SkipForward className="w-7 h-7" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleRepeat}
                  className={`p-2 rounded-xl transition-colors ${repeat !== 'off' ? 'text-[#D40000]' : 'text-[#9CA3AF] hover:text-white'}`} aria-label={`Repeat: ${repeat}`}>
                  {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                </motion.button>
              </div>

              <div className="flex items-center gap-3 w-full max-w-xs group/slider">
                <button onClick={handleMuteToggle} className="flex-shrink-0 text-[#9CA3AF] hover:text-white transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted || effectiveVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <Slider value={effectiveVolume} max={1} step={0.01} onChange={handleVolumeChange} ariaLabel="Volume" className="flex-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed bottom-0 left-0 right-0 z-40 glass-effect-strong border-t border-[rgba(255,255,255,0.06)] ${className}`}
        role="region" aria-label="Audio player"
      >
        <div className="relative h-[3px] bg-[rgba(255,255,255,0.06)]">
          <div className="h-full bg-[#D40000]" style={{ width: `${progressPercent}%` }} aria-hidden="true" />
          <input type="range" min={0} max={currentTrack.duration || 1} step={0.1} value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer" style={{ opacity: 0, height: '100%', zIndex: 10 }} aria-label="Track progress" />
        </div>

        <div className="container-premium py-3 lg:py-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <div onClick={() => setIsExpanded(true)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group/info"
              role="button" tabIndex={0} aria-label="Expand player" onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(true)}>
              <motion.div layoutId="player-album-art" className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden">
                <Image src={currentTrack.image} alt={`${currentTrack.title} cover`} fill className="object-cover" sizes="44px" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#FFFFFF] truncate group-hover/info:text-[#D40000] transition-colors">{currentTrack.title}</p>
                <p className="text-xs text-[#9CA3AF] truncate">{currentTrack.artist}</p>
              </div>
              <ChevronUp className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 hidden sm:block group-hover/info:text-white transition-colors" />
            </div>

            <div className="hidden sm:block flex-shrink-0"><WaveformBars isPlaying={isPlaying} /></div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={previousTrack}
                className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all" aria-label="Previous">
                <SkipBack className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-[#D40000] flex items-center justify-center hover:bg-[#8B1111] transition-all shadow-md shadow-[#D40000]/30"
                aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause className="w-4 h-4 fill-current text-white" /> : <Play className="w-4 h-4 fill-current text-white ml-0.5" />}
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextTrack}
                className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all" aria-label="Next">
                <SkipForward className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => currentTrack && toggleLike(currentTrack.id)}
                className={`p-2 rounded-xl transition-all ${liked ? 'text-[#D40000]' : 'text-[#9CA3AF] hover:text-white'}`}
                aria-label={liked ? 'Unlike' : 'Like'}>
                <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
              </motion.button>
              <div className="flex items-center gap-2">
                <button onClick={handleMuteToggle} className="text-[#9CA3AF] hover:text-white transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted || effectiveVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="w-24 group/slider">
                  <Slider value={effectiveVolume} max={1} step={0.02} onChange={handleVolumeChange} ariaLabel="Volume" />
                </div>
              </div>
              <span className="text-xs text-[#9CA3AF] tabular-nums whitespace-nowrap min-w-[80px] text-right">
                {formatDuration(currentTime)} / {formatDuration(currentTrack.duration)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AudioPlayer;
