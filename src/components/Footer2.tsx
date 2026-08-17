/**
 * Footer Component
 * 
 * Premium footer with multiple sections, links, and social media.
 * Features:
 * - Newsletter signup
 * - Quick links
 * - Social media
 * - Copyright info
 * - Minimal design
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Code2 as Github, MessageCircle as Twitter, Camera as Instagram, Briefcase as Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Download', 'Security', 'Roadmap'],
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
    },
    {
      title: 'Resources',
      links: ['Help', 'Community', 'API Docs', 'Status', 'Guidelines'],
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'License', 'Cookies', 'Settings'],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <footer className="relative bg-[#000000] border-t border-[rgba(255,255,255,0.08)]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Footer Content */}
      <div className="relative z-10 container-premium py-16 lg:py-20 space-y-16">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pb-12 border-b border-[rgba(255,255,255,0.08)]"
        >
          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#FFFFFF]">
              Stay Connected
            </h3>
            <p className="text-[#9CA3AF]">
              Get the latest updates, new releases, and exclusive content delivered to your inbox.
            </p>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.08)] text-[#FFFFFF] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D40000] transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-[#D40000] text-[#FFFFFF] font-medium hover:bg-[#8B1111] transition-all"
              >
                <Mail className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Social Media */}
          <div className="lg:text-right space-y-4">
            <h4 className="text-lg font-semibold text-[#FFFFFF]">
              Follow Us
            </h4>
            <div className="flex gap-3 lg:justify-end">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, color: '#D40000' }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-lg bg-[#111111] text-[#9CA3AF] hover:text-[#D40000] transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Links Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-[rgba(255,255,255,0.08)]"
        >
          {footerSections.map((section) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-[#FFFFFF] uppercase tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-[#9CA3AF] hover:text-[#D40000] transition-colors duration-200"
                    >
                      {link}
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
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#9CA3AF]"
        >
          <div>
            <p>
              © {new Date().getFullYear()} ESHANI. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#D40000] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#D40000] transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-[#D40000] transition-colors">
              Cookies
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
