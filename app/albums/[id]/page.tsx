'use client';

import React, { useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SongRow, Footer } from '@/components';
import { ALBUMS, ALL_SONGS } from '@/data/mockData';
import { formatDuration } from '@/utils/helpers';
import useLibraryStore from '@/store/libraryStore';
import usePlayerStore from '@/store/playerStore';
import { Track as StoreTrack } from '@/types';
import { ChevronLeft, Play, Bookmark, BookmarkCheck, Calendar, Music2 } from 'lucide-react';

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const album = ALBUMS.find((a) => a.id === id);

  if (!album) {
    notFound();
  }

  const albumSongs = ALL_SONGS.filter((s) => album.songIds.includes(s.id));
  const { toggleLike, isLiked, toggleSaveAlbum, isAlbumSaved } = useLibraryStore();
  const { setQueue, playTrack } = usePlayerStore();
  const saved = isAlbumSaved(album.id);

  const handlePlayAll = useCallback(() => {
    const queue: StoreTrack[] = albumSongs.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: album.title,
      duration: t.duration,
      image: t.image, coverUrl: t.image,
      audioUrl: t.audioUrl ?? '',
      genre: t.genre ?? '',
      plays: t.plays ?? 0,
      liked: isLiked(t.id),
    }));
    setQueue(queue);
    if (queue[0]) playTrack(queue[0]);
  }, [albumSongs, album.title, isLiked, setQueue, playTrack]);

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Back button */}
      <div className="container-premium pt-24 pb-0">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href="/albums"
            className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
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
            <Image
              src={album.image}
              alt={album.title}
              fill
              className="object-cover"
              sizes="256px"
              priority
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-end gap-4">
            <div>
              <p className="text-xs font-semibold text-[#D40000] uppercase tracking-widest mb-2">Album</p>
              <h1
                className="text-3xl lg:text-5xl font-black text-white leading-tight"
                style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
              >
                {album.title}
              </h1>
              <p className="text-[#9CA3AF] mt-1 font-medium">ESHANI</p>
            </div>

            {album.description && (
              <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-lg">{album.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(album.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" />
                {albumSongs.length} tracks
              </span>
              <span>{formatDuration(album.duration)}</span>
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
                <Play className="w-4 h-4 fill-current" />
                Play Album
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSaveAlbum(album.id)}
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
