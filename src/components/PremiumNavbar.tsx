'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  Crown,
  Compass,
  Home,
  Library,
  Music2,
  LogIn,
  UserPlus,
  Play,
} from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import EshaniLogo from './EshaniLogo';
import { ALL_SONGS } from '@/data/mockData';
import usePlayerStore from '@/store/playerStore';
import { Track as StoreTrack } from '@/types';

const NAV_LINKS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'Library', href: '/library', icon: Library },
  { label: 'Eshani', href: '/eshani', icon: Music2 },
];

interface PremiumNavbarProps {
  className?: string;
}

const PremiumNavbar: React.FC<PremiumNavbarProps> = ({ className = '' }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { playTrack, setQueue } = usePlayerStore();

  const handleNavClick = (href: string, label: string) => {
    setActiveLink(label);
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Double RAF ensures DOM is painted before focusing
  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => requestAnimationFrame(() => searchRef.current?.focus()));
    } else {
      setShowSuggestions(false);
    }
  }, [isSearchOpen]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Real-time search suggestions — prioritise title-starts-with matches
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_SONGS
      .filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.genre ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const aStart = a.title.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.title.toLowerCase().startsWith(q) ? 0 : 1;
        return aStart - bStart;
      })
      .slice(0, 6);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionPlay = (songId: string) => {
    const song = ALL_SONGS.find((s) => s.id === songId);
    if (!song) return;
    const storeTrack: StoreTrack = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album ?? '',
      duration: song.duration,
      image: song.image,
      coverUrl: song.image,
      audioUrl: song.audioUrl ?? '',
      genre: song.genre ?? '',
      plays: song.plays ?? 0,
      liked: false,
      youtubeId: song.youtubeId,
      isPremium: song.isPremium,
    };
    setQueue([storeTrack]);
    playTrack(storeTrack);
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => searchRef.current?.focus()));
  };

  return (
    <>
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-effect-strong shadow-xl shadow-black/30'
            : 'bg-transparent'
        } ${className}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container-premium flex items-center justify-between h-16 lg:h-20 gap-4">

          {/* Logo */}
          <Link
            href="/"
            onClick={() => { if (pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center flex-shrink-0"
            aria-label="ESHANI Home"
          >
            <motion.div
              whileHover={{ scale: 1.04, opacity: 0.85 }}
              transition={{ duration: 0.18 }}
              className="text-white"
            >
              <EshaniLogo width={110} height={30} />
            </motion.div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 mx-4">
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.label;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => handleNavClick(link.href, link.label)}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group"
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-xl bg-[rgba(255,255,255,0.06)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors ${isActive ? 'text-[#FFFFFF]' : 'text-[#9CA3AF] group-hover:text-[#FFFFFF]'}`}>
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0.5 left-4 right-4 h-[2px] bg-[#D40000] rounded-full"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-2">

            {/* Search with autocomplete */}
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.form
                  key="search-expanded"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '260px' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSearch}
                  className="flex items-center gap-2 overflow-visible"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                    <input
                      ref={searchRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(e.target.value.trim().length > 0);
                      }}
                      onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                      placeholder="Search artists, songs..."
                      className="w-full h-9 pl-10 pr-4 rounded-xl text-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[#FFFFFF] placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none transition-all"
                      aria-label="Search music"
                      autoComplete="off"
                    />

                    {/* Suggestions dropdown */}
                    <AnimatePresence>
                      {showSuggestions && searchResults.length > 0 && (
                        <motion.div
                          ref={suggestionsRef}
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 4, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden"
                        >
                          <div className="px-3 pt-2 pb-1">
                            <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest">Songs</p>
                          </div>
                          {searchResults.map((song) => (
                            <button
                              key={song.id}
                              type="button"
                              onClick={() => handleSuggestionPlay(song.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[rgba(255,255,255,0.06)] transition-colors text-left group/sug"
                            >
                              <div className="relative w-9 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-[#181818]">
                                <Image src={song.image} alt={song.title} fill className="object-cover" sizes="36px" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/sug:opacity-100 flex items-center justify-center transition-opacity">
                                  <Play className="w-3 h-3 text-white fill-current" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{song.title}</p>
                                <p className="text-xs text-[#9CA3AF] truncate">{song.artist}</p>
                              </div>
                              {song.isPremium && (
                                <span className="text-[9px] font-bold bg-[#D40000] text-white px-1.5 py-0.5 rounded-full flex-shrink-0">PREMIUM</span>
                              )}
                            </button>
                          ))}
                          <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.06)]">
                            <button
                              type="submit"
                              className="text-xs text-[#9CA3AF] hover:text-white transition-colors w-full text-left"
                            >
                              Search for &quot;{searchQuery}&quot; →
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setShowSuggestions(false); }}
                    className="p-2 rounded-lg text-[#9CA3AF] hover:text-white transition-colors flex-shrink-0"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openSearch}
                  className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#FFFFFF] hover:bg-[rgba(255,255,255,0.06)] transition-all"
                  aria-label="Open search"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Auth-dependent section */}
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/subscribe"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#8B1111] transition-all duration-200"
                        aria-label="Subscribe"
                      >
                        <Crown className="w-4 h-4" />
                        Subscribe
                      </Link>
                    </motion.div>
                    <div className="ml-1">
                      <UserButton
                        appearance={{
                          variables: {
                            colorPrimary: '#D40000',
                            colorBackground: '#111111',
                            colorNeutral: '#ffffff',
                            borderRadius: '12px',
                          },
                          elements: {
                            avatarBox: 'w-9 h-9',
                            userButtonPopoverCard: 'bg-[#111111] border border-white/10 shadow-2xl',
                            userButtonPopoverActions: 'bg-[#111111]',
                            userButtonPopoverActionButton: 'text-[#D9D9D9] hover:bg-white/[0.06] hover:text-white rounded-lg',
                            userButtonPopoverActionButtonText: 'text-[#D9D9D9] font-medium',
                            userButtonPopoverActionButtonIcon: 'text-[#9CA3AF]',
                            userButtonPopoverFooter: 'border-t border-white/[0.06]',
                            userPreviewMainIdentifier: 'text-white font-semibold',
                            userPreviewSecondaryIdentifier: 'text-[#9CA3AF] text-xs',
                            userPreviewAvatarBox: 'w-10 h-10',
                          },
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href="/sign-in"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#D9D9D9] hover:text-white border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.06)] transition-all"
                        aria-label="Sign in"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Link
                        href="/sign-up"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#8B1111] transition-all"
                        aria-label="Get started"
                      >
                        <UserPlus className="w-4 h-4" />
                        Get Started
                      </Link>
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile: Search + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {isLoaded && isSignedIn && (
              <div className="mr-1">
                <UserButton
                  appearance={{
                    variables: { colorPrimary: '#D40000', borderRadius: '10px' },
                    elements: { avatarBox: 'w-8 h-8' },
                  }}
                />
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-[#D9D9D9] hover:bg-[rgba(255,255,255,0.06)] transition-all"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-[rgba(255,255,255,0.06)]"
            >
              <form className="container-premium py-3" onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.trim().length > 0);
                    }}
                    placeholder="Search artists, songs, playlists..."
                    className="w-full h-11 pl-11 pr-4 rounded-xl text-sm bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#9CA3AF] focus:border-[#D40000] focus:outline-none"
                    aria-label="Search music"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {/* Mobile suggestions */}
                <AnimatePresence>
                  {showSuggestions && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="mt-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden"
                    >
                      {searchResults.map((song) => (
                        <button
                          key={song.id}
                          type="button"
                          onClick={() => handleSuggestionPlay(song.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[rgba(255,255,255,0.06)] transition-colors text-left"
                        >
                          <div className="relative w-9 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-[#181818]">
                            <Image src={song.image} alt={song.title} fill className="object-cover" sizes="36px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{song.title}</p>
                            <p className="text-xs text-[#9CA3AF] truncate">{song.artist}</p>
                          </div>
                          {song.isPremium && (
                            <span className="text-[9px] font-bold bg-[#D40000] text-white px-1.5 py-0.5 rounded-full flex-shrink-0">PREMIUM</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 lg:hidden glass-effect-strong border-l border-[rgba(255,255,255,0.08)] flex flex-col"
              role="dialog"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.08)]">
                <div className="text-white">
                  <EshaniLogo width={90} height={24} />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Mobile menu">
                {NAV_LINKS.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = activeLink === link.label;
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => { handleNavClick(link.href, link.label); setIsMenuOpen(false); }}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[rgba(212,0,0,0.12)] text-[#D40000] border border-[rgba(212,0,0,0.2)]'
                            : 'text-[#D9D9D9] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="px-4 py-6 border-t border-[rgba(255,255,255,0.08)] space-y-2">
                {isLoaded && isSignedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] mb-2">
                      <UserButton
                        appearance={{
                          variables: { colorPrimary: '#D40000', borderRadius: '8px' },
                          elements: { avatarBox: 'w-8 h-8' },
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {user?.firstName ?? user?.username ?? 'User'}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF] truncate">
                          {user?.primaryEmailAddress?.emailAddress ?? ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/subscribe"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#8B1111] transition-all"
                    >
                      <Crown className="w-4 h-4" />
                      Subscribe
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-[rgba(255,255,255,0.12)] text-white text-sm font-medium hover:bg-[rgba(255,255,255,0.06)] transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#D40000] text-white text-sm font-semibold hover:bg-[#8B1111] transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      Get Started — Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PremiumNavbar;
