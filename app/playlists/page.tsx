'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PlaylistCard, SectionHeader, Footer } from '@/components';
import { FEATURED_PLAYLISTS } from '@/data/mockData';
import useLibraryStore from '@/store/libraryStore';
import { Plus, X, ListMusic, Trash2, ArrowRight } from 'lucide-react';

export default function PlaylistsPage() {
  const { localPlaylists, createPlaylist, deletePlaylist } = useLibraryStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      createPlaylist(newName.trim(), newDesc.trim());
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
    }
  };

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Header */}
      <div className="container-premium pt-28 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between"
        >
          <div>
            <div className="h-0.5 w-10 bg-[#D40000] rounded-full mb-3" />
            <h1
              className="text-4xl lg:text-5xl font-black text-white leading-tight"
              style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
            >
              Playlists
            </h1>
            <p className="text-[#9CA3AF] mt-2 text-base">
              Official collections &amp; your personal playlists
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(212,0,0,0.3)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </motion.button>
        </motion.div>
      </div>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setShowCreate(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-3xl p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                    Create Playlist
                  </h2>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="p-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#9CA3AF] mb-2" htmlFor="pl-name">
                      Playlist name
                    </label>
                    <input
                      id="pl-name"
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="My awesome playlist"
                      maxLength={60}
                      autoFocus
                      className="w-full h-12 px-4 rounded-xl text-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none transition-all"
                      aria-label="Playlist name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#9CA3AF] mb-2" htmlFor="pl-desc">
                      Description (optional)
                    </label>
                    <input
                      id="pl-desc"
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="A collection of my favourite tracks..."
                      maxLength={120}
                      className="w-full h-12 px-4 rounded-xl text-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none transition-all"
                      aria-label="Playlist description"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="flex-1 h-12 rounded-xl border border-[rgba(255,255,255,0.12)] text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.06)] text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newName.trim()}
                      className="flex-1 h-12 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#8B1111] disabled:opacity-40 transition-all"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Your Playlists */}
      {localPlaylists.length > 0 && (
        <section className="container-premium pb-12">
          <SectionHeader title="Your Playlists" subtitle={`${localPlaylists.length} playlist${localPlaylists.length !== 1 ? 's' : ''}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localPlaylists.map((pl) => (
              <AnimatePresence key={pl.id}>
                {deleteConfirm === pl.id ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-[rgba(212,0,0,0.1)] border border-[rgba(212,0,0,0.25)]"
                  >
                    <p className="flex-1 text-sm text-white">Delete &ldquo;{pl.name}&rdquo;?</p>
                    <button
                      onClick={() => { deletePlaylist(pl.id); setDeleteConfirm(null); }}
                      className="px-3 py-1.5 rounded-lg bg-[#D40000] text-white text-xs font-semibold"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.15)] text-[#9CA3AF] text-xs"
                    >
                      Cancel
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.07)] transition-all group"
                  >
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-[rgba(212,0,0,0.15)] border border-[rgba(212,0,0,0.2)] flex items-center justify-center">
                      <ListMusic className="w-6 h-6 text-[#D40000]" />
                    </div>
                    <Link href={`/playlists/${pl.id}`} className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-[#D40000] transition-colors">
                        {pl.name}
                      </p>
                      {pl.description && (
                        <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{pl.description}</p>
                      )}
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{pl.songIds.length} tracks</p>
                    </Link>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/playlists/${pl.id}`}
                        className="p-2 rounded-lg text-[#9CA3AF] hover:text-white transition-colors"
                        aria-label="View playlist"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(pl.id)}
                        className="p-2 rounded-lg text-[#9CA3AF] hover:text-red-400 transition-colors"
                        aria-label="Delete playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </section>
      )}

      {localPlaylists.length === 0 && (
        <section className="container-premium pb-12">
          <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(212,0,0,0.1)] border border-[rgba(212,0,0,0.2)] flex items-center justify-center">
              <ListMusic className="w-7 h-7 text-[#D40000]" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">No playlists yet</p>
              <p className="text-[#9CA3AF] text-sm">Create your first playlist and add your favourite ESHANI tracks.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D40000] text-white text-sm font-semibold rounded-xl hover:bg-[#8B1111] transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Playlist
            </motion.button>
          </div>
        </section>
      )}

      {/* Official Playlists */}
      <section className="container-premium pb-16">
        <div className="h-px bg-[rgba(255,255,255,0.06)] mb-10" />
        <SectionHeader
          title="Official Playlists"
          subtitle="Curated by ESHANI Editorial"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {FEATURED_PLAYLISTS.map((pl, i) => (
            <PlaylistCard key={pl.id} playlist={pl} index={i} />
          ))}
        </div>
      </section>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}
