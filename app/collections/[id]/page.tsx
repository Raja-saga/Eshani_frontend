'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SongRow, Footer } from '@/components';
import useLibraryStore from '@/store/libraryStore';
import usePlayerStore from '@/store/playerStore';
import { Track as StoreTrack } from '@/types';
import { ChevronLeft, Play, Pause, Layers, Loader2 } from 'lucide-react';

interface ApiSong {
  id: string; title: string; artist: string; album: string | null;
  audio_url: string; image_url: string; duration: number; plays: number;
  genre: string | null; is_premium: number;
}

interface CollectionData {
  id: string; name: string; description: string; image_url: string;
}

function mapSong(s: ApiSong) {
  return {
    id: s.id, title: s.title, artist: s.artist, album: s.album ?? '',
    duration: s.duration, image: s.image_url, coverUrl: s.image_url,
    audioUrl: s.audio_url ?? '', genre: s.genre ?? '', plays: s.plays ?? 0,
    isPremium: Boolean(s.is_premium),
  };
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toggleLike, isLiked } = useLibraryStore();
  const { setQueue, playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayerStore();

  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [songs, setSongs] = useState<ReturnType<typeof mapSong>[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/collections/${id}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return; }
        const data = await r.json();
        setCollection(data.collection);
        setSongs((data.songs ?? []).map(mapSong));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const isActive = songs.some((s) => s.id === currentTrack?.id);
  const isPlayingCollection = isActive && isPlaying;

  const handlePlayAll = useCallback(() => {
    if (isPlayingCollection) { setIsPlaying(false); return; }
    if (isActive) { setIsPlaying(true); return; }
    const queue: StoreTrack[] = songs.map((t) => ({
      id: t.id, title: t.title, artist: t.artist, album: collection?.name ?? '',
      duration: t.duration, image: t.image, coverUrl: t.image,
      audioUrl: t.audioUrl, genre: t.genre, plays: t.plays, liked: isLiked(t.id),
    }));
    setQueue(queue);
    if (queue[0]) playTrack(queue[0]);
  }, [isActive, isPlayingCollection, songs, collection, isLiked, setQueue, playTrack, setIsPlaying]);

  if (loading) {
    return (
      <div className="bg-[#000000] text-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D40000]" />
      </div>
    );
  }

  if (notFound || !collection) {
    return (
      <div className="bg-[#000000] text-white min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold">Collection not found</p>
        <Link href="/library" className="text-[#D40000] hover:underline text-sm">Back to Library</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      <div className="container-premium pt-24 pb-0">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href="/library?tab=collections"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-sm font-semibold text-white hover:bg-[rgba(255,255,255,0.12)] transition-all mb-8"
          >
            <ChevronLeft className="w-4 h-4 text-[#D40000]" />
            Collections
          </Link>
        </motion.div>
      </div>

      <div className="container-premium pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-8 items-start"
        >
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {collection.image_url ? (
              <Image src={collection.image_url} alt={collection.name} fill className="object-cover" sizes="256px" priority unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                <Layers className="w-16 h-16 text-[#333]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-end gap-4">
            <div>
              <p className="text-xs font-semibold text-[#D40000] uppercase tracking-widest mb-2">Collection</p>
              <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-[#9CA3AF] mt-2 text-sm leading-relaxed max-w-lg">{collection.description}</p>
              )}
              <p className="text-[#9CA3AF] mt-2 text-sm">{songs.length} tracks</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,0,0,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlayAll}
                disabled={songs.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#D40000] text-white font-semibold rounded-xl hover:bg-[#8B1111] transition-all disabled:opacity-40"
              >
                {isPlayingCollection ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isPlayingCollection ? 'Pause' : 'Play All'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <section className="container-premium pb-16">
        <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
        {songs.length === 0 ? (
          <p className="text-[#9CA3AF] py-8 text-center">No tracks in this collection yet.</p>
        ) : (
          <div>
            {songs.map((t, i) => {
              const queue = songs.map((s) => ({
                id: s.id, title: s.title, artist: s.artist, album: collection.name,
                duration: s.duration, image: s.image, coverUrl: s.image,
                audioUrl: s.audioUrl, genre: s.genre, plays: s.plays, liked: isLiked(s.id),
              }));
              return (
                <SongRow key={t.id} track={t} index={i} liked={isLiked(t.id)} onLike={() => toggleLike(t.id)} queue={queue} />
              );
            })}
          </div>
        )}
      </section>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}
