'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UpcomingTrackCard, Footer } from '@/components';
import { UPCOMING_RELEASES } from '@/data/mockData';

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function UpcomingPage() {
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
            Coming Soon
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-base">
            Upcoming releases from ESHANI — be the first to know
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <section className="container-premium pb-16">
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5"
        >
          {UPCOMING_RELEASES.map((release, i) => (
            <UpcomingTrackCard key={release.id} release={release} index={i} />
          ))}
        </motion.div>
      </section>

      <Footer />
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}
