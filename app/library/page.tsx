'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { SongRow, Footer } from '@/components';
import { ALL_SONGS, ALBUMS, COLLECTIONS, FEATURED_PLAYLISTS } from '@/data/mockData';
import useLibraryStore from '@/store/libraryStore';
import { Heart, Clock, ListMusic, Disc3, Layers, Play, ArrowRight } from 'lucide-react';
import usePlayerStore from '@/store/playerStore';
import { Track as StoreTrack } from '@/types';
import { formatDuration } from '@/utils/helpers';

type Tab = 'liked' | 'recent' | 'playlists' | 'albums' | 'collections';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'liked', label: 'Liked Songs', icon: Heart },
  { key: 'recent', label: 'Recently Played', icon: Clock },
  { key: 'playlists', label: 'Playlists', icon: ListMusic },
  { key: 'albums', label: 'Saved Albums', icon: Disc3 },
  { key: 'collections', label: 'Collections', icon: Layers },
];

const EmptyState = ({ icon: Icon, message, action }: { icon: React.ElementType; message: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
      <Icon className="w-7 h-7 text-[#9CA3AF]" />
    </div>
    <p className="text-[#9CA3AF] text-base">{message}</p>
    {action}
  </div>
);

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('liked');
  const {
    likedSongIds,
    savedAlbumIds,
    localPlaylists,
    recentlyPlayedIds,
    toggleLike,
    isLiked,
  } = useLibraryStore();
  const { setQueue, playTrack } = usePlayerStore();

  const likedSongs = useMemo(
    () => ALL_SONGS.filter((t) => likedSongIds.includes(t.id)),
    [likedSongIds]
  );

  const savedAlbums = useMemo(
    () => ALBUMS.filter((a) => savedAlbumIds.includes(a.id)),
    [savedAlbumIds]
  );

  const recentlyPlayed = useMemo(() => {
    const songMap = new Map(ALL_SONGS.map((s) => [s.id, s]));
    return recentlyPlayedIds.map((id) => songMap.get(id)).filter(Boolean) as typeof ALL_SONGS;
  }, [recentlyPlayedIds]);

  const handlePlaySongs = (songs: typeof ALL_SONGS) => {
    const queue: StoreTrack[] = songs.map((t) => ({
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
    }));
    setQueue(queue);
    if (queue[0]) playTrack(queue[0]);
  };

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Header */}
      <div className="container-premium pt-28 pb-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="h-0.5 w-10 bg-[#D40000] rounded-full mb-3" />
          <h1
            className="text-4xl lg:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            Your Library
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-base">
            Your personal music collection
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-[#D40000] text-white'
                    : 'bg-[rgba(255,255,255,0.06)] text-[#9CA3AF] hover:text-white border border-[rgba(255,255,255,0.08)]'
                }`}
                aria-pressed={activeTab === tab.key}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <section className="container-premium pb-16">
        <AnimatePresence mode="wait">
          {/* â”€â”€ Liked Songs â”€â”€ */}
          {activeTab === 'liked' && (
            <motion.div key="liked" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {likedSongs.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  message="No liked songs yet. Like any track to add it here."
                  action={
                    <Link href="/discover" className="flex items-center gap-1.5 text-sm text-[#D40000] hover:underline">
                      Discover music <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[#9CA3AF]">{likedSongs.length} songs</p>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handlePlaySongs(likedSongs)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play All
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                    {likedSongs.map((t, i) => (
                      <SongRow key={t.id} track={t} index={i} liked={true} onLike={() => toggleLike(t.id)} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* â”€â”€ Recently Played â”€â”€ */}
          {activeTab === 'recent' && (
            <motion.div key="recent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {recentlyPlayed.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  message="Your recently played tracks will appear here."
                  action={
                    <Link href="/discover" className="flex items-center gap-1.5 text-sm text-[#D40000] hover:underline">
                      Start listening <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[#9CA3AF]">{recentlyPlayed.length} tracks</p>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handlePlaySongs(recentlyPlayed)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play All
                    </motion.button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                    {recentlyPlayed.map((t, i) => (
                      <SongRow key={t.id} track={t} index={i} liked={isLiked(t.id)} onLike={() => toggleLike(t.id)} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* â”€â”€ Playlists â”€â”€ */}
          {activeTab === 'playlists' && (
            <motion.div key="playlists" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {/* Official playlists */}
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                Official Playlists
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {FEATURED_PLAYLISTS.map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.07)] transition-all cursor-pointer group"
                  >
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image src={pl.image} alt={pl.title} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{pl.title}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{pl.trackCount} tracks</p>
                    </div>
                    <Play className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#D40000] transition-colors ml-auto flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Your playlists */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                  Your Playlists
                </h3>
                <Link
                  href="/playlists"
                  className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#D40000] transition-colors"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {localPlaylists.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[#9CA3AF] text-sm mb-3">No playlists yet</p>
                  <Link
                    href="/playlists"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
                  >
                    Create a Playlist
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localPlaylists.map((pl) => (
                    <Link
                      key={pl.id}
                      href={`/playlists/${pl.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.07)] transition-all group"
                    >
                      <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-[rgba(212,0,0,0.15)] border border-[rgba(212,0,0,0.2)] flex items-center justify-center">
                        <ListMusic className="w-6 h-6 text-[#D40000]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">{pl.songIds.length} tracks</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-white transition-colors ml-auto flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* â”€â”€ Saved Albums â”€â”€ */}
          {activeTab === 'albums' && (
            <motion.div key="albums" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {savedAlbums.length === 0 ? (
                <EmptyState
                  icon={Disc3}
                  message="No saved albums. Save albums from the Albums page."
                  action={
                    <Link href="/albums" className="flex items-center gap-1.5 text-sm text-[#D40000] hover:underline">
                      Browse albums <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {savedAlbums.map((album) => (
                    <Link key={album.id} href={`/albums/${album.id}`} className="group">
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-[#111111]">
                        <Image
                          src={album.image}
                          alt={album.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </div>
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#D40000] transition-colors">
                        {album.title}
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        {album.trackCount} tracks Â· {formatDuration(album.duration)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* â”€â”€ Collections â”€â”€ */}
          {activeTab === 'collections' && (
            <motion.div key="collections" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {COLLECTIONS.map((col) => {
                  const colSongs = ALL_SONGS.filter((s) => col.songIds.includes(s.id));
                  return (
                    <motion.div
                      key={col.id}
                      whileHover={{ y: -2 }}
                      className="group rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] cursor-pointer"
                      onClick={() => colSongs.length > 0 && handlePlaySongs(colSongs)}
                    >
                      <div className="relative h-36 overflow-hidden">
                        <Image
                          src={col.image}
                          alt={col.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                          <h3
                            className="text-base font-bold text-white"
                            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                          >
                            {col.name}
                          </h3>
                          <div className="w-9 h-9 rounded-full bg-[#D40000] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                            <Play className="w-4 h-4 text-white fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-[#9CA3AF]">{col.description}</p>
                        <p className="text-xs text-[#9CA3AF] mt-1">{colSongs.length} tracks</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}

