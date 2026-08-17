'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components';
import { ALBUMS } from '@/data/mockData';
import { formatDuration } from '@/utils/helpers';
import useLibraryStore from '@/store/libraryStore';
import { Bookmark, BookmarkCheck, Disc3 } from 'lucide-react';

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AlbumsPage() {
  const { toggleSaveAlbum, isAlbumSaved } = useLibraryStore();

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen">
      {/* Header */}
      <div className="container-premium pt-28 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-0.5 w-10 bg-[#D40000] rounded-full mb-3" />
          <h1
            className="text-4xl lg:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
          >
            Albums
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-base">
            {ALBUMS.length} studio collections · All by ESHANI
          </p>
        </motion.div>
      </div>

      {/* Albums Grid */}
      <section className="container-premium pb-16">
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {ALBUMS.map((album) => {
            const saved = isAlbumSaved(album.id);
            return (
              <motion.div key={album.id} variants={cardVariants} className="group">
                <Link href={`/albums/${album.id}`} className="block">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#111111] mb-4">
                    <Image
                      src={album.image}
                      alt={album.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1 }}
                        className="w-14 h-14 rounded-full bg-[#D40000] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Disc3 className="w-6 h-6 text-white" />
                      </motion.div>
                    </div>
                  </div>
                </Link>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/albums/${album.id}`}>
                      <h3
                        className="text-base font-bold text-white truncate hover:text-[#D40000] transition-colors"
                        style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}
                      >
                        {album.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-[#9CA3AF] mt-0.5">
                      {album.trackCount} tracks · {formatDuration(album.duration)}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {new Date(album.releaseDate).getFullYear()}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleSaveAlbum(album.id)}
                    className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                      saved
                        ? 'text-[#D40000]'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                    aria-label={saved ? 'Remove from saved' : 'Save album'}
                  >
                    {saved ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>

                {album.description && (
                  <p className="text-xs text-[#9CA3AF] mt-1.5 line-clamp-2 leading-relaxed">
                    {album.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}
