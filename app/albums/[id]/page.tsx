'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SongRow, Footer } from '@/components';
import { ALBUMS, ALL_SONGS } from '@/data/mockData';
import { formatDuration } from '@/utils/helpers';
import useLibraryStore from '@/store/libraryStore';
import usePlayerStore from '@/store/playerStore';
import { Track as StoreTrack } from '@/types';
import { ChevronLeft, Play, Pause, Bookmark, BookmarkCheck, Calendar, Music2, Loader2 } from 'lucide-react';

interface ApiSong {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  audio_url: string;
  image_url: string;
  duration: number;
  plays: number;
  genre: string | null;
  is_premium: number;
}

interface AlbumData {
  id: string;
  title: string;
  image_url: string;
  release_date: string | null;
  description: string | null;
  track_count: number;
  total_duration: number;
}

function mapApiSongToTrack(s: ApiSong) {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album ?? '',
    duration: s.duration,
    image: s.image_url || '',
    coverUrl: s.image_url || '',
    audioUrl: s.audio_url ?? '',
    genre: s.genre ?? '',
    plays: s.plays ?? 0,
    isPremium: Boolean(s.is_premium),
  };
}

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [albumData, setAlbumData] = useState<{ title: string; image: string; releaseDate: string; description?: string; duration: number } | null>(null);
  const [albumSongs, setAlbumSongs] = useState<ReturnType<typeof mapApiSongToTrack>[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const { toggleLike, isLiked, toggleSaveAlbum, isAlbumSaved } = useLibraryStore();
  const { setQueue, playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    // Try mockData first
    const mockAlbum = ALBUMS.find((a) => a.id === id);
    if (mockAlbum) {
      const mockSongs = ALL_SONGS.filter((s) => mockAlbum.songIds.includes(s.id));
      setAlbumData({
        title: mockAlbum.title,
        image: mockAlbum.image,
        releaseDate: mockAlbum.releaseDate,
        description: mockAlbum.description,
        duration: mockAlbum.duration,
      });
      setAlbumSongs(mockSongs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: mockAlbum.title,
        duration: s.duration,
        image: s.image,
        coverUrl: s.image,
        audioUrl: s.audioUrl ?? '',
        genre: s.genre ?? '',
        plays: s.plays ?? 0,
        isPremium: s.isPremium ?? false,
      })));
      setLoading(false);
      return;
    }

    // Fallback to API for DB albums
    fetch(`/api/albums/${id}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFoundState(true); return; }
        const { album, songs } = await r.json() as { album: AlbumData; songs: ApiSong[] };
        setAlbumData({
          title: album.title,
          image: album.image_url || '',
          releaseDate: album.release_date ?? new Date().toISOString(),
          description: album.description ?? undefined,
          duration: Number(album.total_duration ?? 0),
        });
        setAlbumSongs((songs ?? []).map(mapApiSongToTrack));
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [id]);

  const isAlbumActive = albumSongs.some((s) => s.id === currentTrack?.id);
  const isAlbumPlaying = isAlbumActive && isPlaying;
  const saved = isAlbumSaved(id);

  const handlePlayAll = useCallback(() => {
    if (isAlbumPlaying) { setIsPlaying(false); return; }
    if (isAlbumActive) { setIsPlaying(true); return; }
    const queue: StoreTrack[] = albumSongs.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: albumData?.title ?? '',
      duration: t.duration,
      image: t.image,
      coverUrl: t.image,
      audioUrl: t.audioUrl,
      genre: t.genre,
      plays: t.plays,
      liked: isLiked(t.id),
    }));
    setQueue(queue);
    if (queue[0]) playTrack(queue[0]);
  }, [isAlbumActive, isAlbumPlaying, albumSongs, albumData, isLiked, setQueue, playTrack, setIsPlaying]);

  if (loading) {
    return (
      <div className="bg-[#000000] text-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D40000]" />
      </div>
    );
  }

  if (notFoundState || !albumData) {
    return (
      <div className="bg-[#000000] text-white min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold">Album not found</p>
        <Link href="/albums" className="text-[#D40000] hover:underline text-sm">Browse all albums</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Back button */}
      <div className="container-premium pt-24 pb-0">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href="/albums"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-sm font-semibold text-white hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)] transition-all mb-8"
          >
            <ChevronLeft className="w-4 h-4 text-[#D40000]" />
            All Albums
          </Link>
        </motion.div>
      </div>

      {/* Album Hero */}
      <div className="container-premium pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-8 items-start"
        >
          {/* Cover */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {albumData.image && (
              <Image
                src={albumData.image}
                alt={albumData.title}
                fill
                className="object-cover"
                sizes="256px"
                priority
                unoptimized
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-end gap-4">
            <div>
              <p className="text-xs font-semibold text-[#D40000] uppercase tracking-widest mb-2">Album</p>
              <h1
                className="text-3xl lg:text-5xl font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
              >
                {albumData.title}
              </h1>
              <p className="text-[#9CA3AF] mt-1 font-medium">ESHANI</p>
            </div>

            {albumData.description && (
              <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-lg">{albumData.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(albumData.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" />
                {albumSongs.length} tracks
              </span>
              {albumData.duration > 0 && <span>{formatDuration(albumData.duration)}</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,0,0,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlayAll}
                disabled={albumSongs.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#D40000] text-white font-semibold rounded-xl hover:bg-[#8B1111] transition-all disabled:opacity-40"
              >
                {isAlbumPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {isAlbumPlaying ? 'Pause' : 'Play Album'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSaveAlbum(id)}
                className={`p-3 rounded-xl border transition-all ${
                  saved
                    ? 'border-[#D40000] text-[#D40000] bg-[rgba(212,0,0,0.1)]'
                    : 'border-[rgba(255,255,255,0.15)] text-[#9CA3AF] hover:text-white hover:border-[rgba(255,255,255,0.3)]'
                }`}
                aria-label={saved ? 'Remove from saved' : 'Save album'}
              >
                {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Song List */}
      <section className="container-premium pb-16">
        <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
        {albumSongs.length === 0 ? (
          <p className="text-[#9CA3AF] py-8 text-center">No tracks available for this album yet.</p>
        ) : (
          <div>
            {albumSongs.map((t, i) => (
              <SongRow
                key={t.id}
                track={t}
                index={i}
                liked={isLiked(t.id)}
                onLike={() => toggleLike(t.id)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}
