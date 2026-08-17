/**
 * Footer Component
 *
 * Premium footer with newsletter, social links, nav columns, and copyright.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Globe, MessageCircle, Camera, Briefcase, Music2 } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Download', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'API Docs', href: '#' },
      { label: 'Status', href: '#' },
      { label: 'Guidelines', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'License', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: MessageCircle, href: '#', label: 'Twitter / X' },
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: Globe, href: '#', label: 'GitHub' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Footer: React.FC = () => {
  return (
    <footer
      className="relative bg-[#000000] border-t border-[rgba(255,255,255,0.08)]"
      role="contentinfo"
    >
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 container-premium py-16 lg:py-20 space-y-14">

        {/* Top Row: Brand + Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start pb-12 border-b border-[rgba(255,255,255,0.08)]"
        >
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D40000] flex items-center justify-center" aria-hidden="true">
                <Music2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-black gradient-text" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                ESHANI
              </span>
            </div>
            <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-sm">
              The official music platform for ESHANI — every track, every release, direct to you.
              No gatekeepers. Pure music.
            </p>

            {/* Social */}
            <div className="flex gap-2 pt-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, color: '#D40000' }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#9CA3AF] hover:text-[#D40000] hover:border-[rgba(212,0,0,0.2)] transition-all"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#FFFFFF] mb-1.5" style={{ fontFamily: 'var(--font-poppins, sans-serif)' }}>
                Stay in the loop
              </h3>
              <p className="text-sm text-[#9CA3AF]">
                New releases, exclusive events, and artist spotlights — straight to your inbox.
              </p>
            </div>
            <div className="flex gap-2 max-w-sm">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-11 px-4 text-sm rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none transition-all"
                aria-label="Email address for newsletter"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="h-11 px-5 rounded-xl bg-[#D40000] text-white font-semibold text-sm hover:bg-[#8B1111] transition-all flex items-center gap-2 flex-shrink-0"
                aria-label="Subscribe to newsletter"
              >
                <Mail className="w-4 h-4" />
                Subscribe
              </motion.button>
            </div>
            <p className="text-[10px] text-[#9CA3AF]">
              We respect your privacy. Unsubscribe anytime. No spam.
            </p>
          </div>
        </motion.div>

        {/* Links Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-12 border-b border-[rgba(255,255,255,0.08)]"
        >
          {FOOTER_LINKS.map((section) => (
            <motion.div key={section.title} variants={itemVariants} className="space-y-4">
              <h4 className="text-xs font-semibold text-[#FFFFFF] uppercase tracking-widest">
                {section.title}
              </h4>
              <ul className="space-y-2.5" role="list">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#9CA3AF] hover:text-[#D40000] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#9CA3AF]"
        >
          <p>© {new Date().getFullYear()} ESHANI. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item) => (
              <Link key={item} href="#" className="hover:text-[#D40000] transition-colors text-xs">
                {item}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
