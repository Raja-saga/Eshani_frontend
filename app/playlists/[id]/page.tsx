'use client';

import React, { useState, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SongRow, Footer } from '@/components';
import { FEATURED_PLAYLISTS } from '@/data/mockData';
import { useLiveCatalog } from '@/hooks/useLiveCatalog';
import useLibraryStore from '@/store/libraryStore';
import { useUserPlaylists } from '@/hooks/useUserPlaylists';
import usePlayerStore from '@/store/playerStore';
import { Track as StoreTrack } from '@/types';
import { ChevronLeft, Play, Pause, ListMusic, Music2, Pencil, Check, X, Plus } from 'lucide-react';

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toggleLike, isLiked, localPlaylists } = useLibraryStore();
  const { renamePlaylist, removeSongFromPlaylist } = useUserPlaylists();
  const { setQueue, playTrack, currentTrack, isPlaying, setIsPlaying } = usePlayerStore();

  const [editingName, setEditingName] = useState(false);
  const [editValue, setEditValue] = useState('');

  const { songs: allSongs } = useLiveCatalog();

  const officialPlaylist = FEATURED_PLAYLISTS.find((p) => p.id === id);
  const localPlaylist = localPlaylists.find((p) => p.id === id);

  if (!officialPlaylist && !localPlaylist) {
    notFound();
  }

  const isLocal = !!localPlaylist;

  const playlistName = isLocal ? localPlaylist!.name : officialPlaylist!.title;
  const playlistDescription = isLocal ? localPlaylist!.description : officialPlaylist!.description;

  const songIds = isLocal ? localPlaylist!.songIds : (officialPlaylist?.songIds ?? []);
  const playlistSongs = allSongs.filter((s) => songIds.includes(s.id))
    .sort((a, b) => songIds.indexOf(a.id) - songIds.indexOf(b.id));

  const officialImage = officialPlaylist?.image;

  // Is any song from this playlist currently playing?
  const isPlaylistActive = playlistSongs.some((s) => s.id === currentTrack?.id);
  const isPlaylistPlaying = isPlaylistActive && isPlaying;

  const handlePlayAll = useCallback(() => {
    if (playlistSongs.length === 0) return;
    if (isPlaylistPlaying) {
      setIsPlaying(false);
      return;
    }
    if (isPlaylistActive) {
      setIsPlaying(true);
      return;
    }
    const queue: StoreTrack[] = playlistSongs.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album ?? '',
      duration: t.duration,
      image: t.image, coverUrl: t.image,
      audioUrl: t.audioUrl ?? '',
      genre: t.genre ?? '',
      plays: t.plays ?? 0,
      liked: isLiked(t.id),
      youtubeId: t.youtubeId,
      isPremium: t.isPremium,
    }));
    setQueue(queue);
    if (queue[0]) playTrack(queue[0]);
  }, [isPlaylistActive, isPlaylistPlaying, playlistSongs, isLiked, setQueue, playTrack, setIsPlaying]);

  const handleRename = async () => {
    if (editValue.trim() && localPlaylist) {
      await renamePlaylist(localPlaylist.id, editValue.trim());
    }
    setEditingName(false);
  };

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Back */}
      <div className="container-premium pt-24 pb-0">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href="/playlists"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] text-sm font-semibold text-white hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)] transition-all mb-8"
          >
            <ChevronLeft className="w-4 h-4 text-[#D40000]" />
            All Playlists
          </Link>
        </motion.div>
      </div>

      {/* Playlist Hero */}
      <div className="container-premium pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-8 items-start"
        >
          {/* Cover */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {officialImage ? (
              <Image src={officialImage} alt={playlistName} fill className="object-cover" sizes="224px" priority />
            ) : (
              <div className="w-full h-full bg-[rgba(212,0,0,0.15)] flex items-center justify-center">
                <ListMusic className="w-16 h-16 text-[#D40000]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-end gap-4">
            <div>
              <p className="text-xs font-semibold text-[#D40000] uppercase tracking-widest mb-2">Playlist</p>
              {isLocal && editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
                    className="text-3xl font-black bg-transparent border-b border-[#D40000] text-white focus:outline-none w-full"
                    autoFocus
                    aria-label="Edit playlist name"
                  />
                  <button onClick={handleRename} className="p-1.5 rounded-lg text-[#D40000]" aria-label="Save name">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg text-[#9CA3AF]" aria-label="Cancel">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1
                    className="text-3xl lg:text-5xl font-black text-white leading-tight"
                    style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                  >
                    {playlistName}
                  </h1>
                  {isLocal && (
                    <button
                      onClick={() => { setEditValue(playlistName); setEditingName(true); }}
                      className="p-2 rounded-xl text-[#9CA3AF] hover:text-white transition-colors flex-shrink-0"
                      aria-label="Edit name"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              {playlistDescription && (
                <p className="text-[#9CA3AF] mt-1.5 text-sm">{playlistDescription}</p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" />
                {isLocal ? playlistSongs.length : officialPlaylist!.trackCount} tracks
              </span>
              {!isLocal && officialPlaylist?.curator && (
                <span>By {officialPlaylist.curator}</span>
              )}
              {!isLocal && officialPlaylist?.mood && (
                <span className="px-2.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-xs">
                  {officialPlaylist.mood}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {playlistSongs.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,0,0,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-6 py-3 bg-[#D40000] text-white font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
                >
                  {isPlaylistPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  {isPlaylistPlaying ? 'Pause' : 'Play Playlist'}
                </motion.button>
              )}
              {isLocal && (
                <Link
                  href={`/songs?addTo=${id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[rgba(255,255,255,0.15)] text-sm font-semibold text-white hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.25)] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Songs
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Song List */}
      <section className="container-premium pb-16">
        <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
        {playlistSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <ListMusic className="w-10 h-10 text-[#9CA3AF]" />
            <p className="text-[#9CA3AF]">This playlist is empty.</p>
            {isLocal ? (
              <Link
                href={`/songs?addTo=${id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#8B1111] transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Songs
              </Link>
            ) : (
              <Link href="/songs" className="text-sm text-[#D40000] hover:underline">
                Browse songs
              </Link>
            )}
          </div>
        ) : (
          <div>
            {playlistSongs.map((t, i) => {
              const queue: StoreTrack[] = playlistSongs.map((s) => ({
                id: s.id, title: s.title, artist: s.artist, album: s.album ?? '',
                duration: s.duration, image: s.image, coverUrl: s.image,
                audioUrl: s.audioUrl ?? '', genre: s.genre ?? '', plays: s.plays ?? 0,
                liked: isLiked(s.id), youtubeId: s.youtubeId, isPremium: s.isPremium,
              }));
              return (
              <div key={t.id} className="group relative">
                <SongRow
                  track={t}
                  index={i}
                  liked={isLiked(t.id)}
                  onLike={() => toggleLike(t.id)}
                  queue={queue}
                />
                {isLocal && (
                  <button
                    onClick={() => removeSongFromPlaylist(id, t.id)}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#9CA3AF] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={`Remove ${t.title} from playlist`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
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
