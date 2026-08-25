'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X, Crown } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import SearchBar from './SearchBar';
import { useToggle } from '@/hooks';
import useSubscriptionStore from '@/store/subscriptionStore';
import EshaniLogo from './EshaniLogo';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const [isMenuOpen, toggleMenu] = useToggle(false);
  const [isDark, toggleDark] = useToggle(false);
  const { isSignedIn } = useUser();
  const { isPremium } = useSubscriptionStore();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-40 backdrop-blur-md bg-background/95 border-b border-border ${className}`}
    >
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="ESHANI Home">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
              <EshaniLogo width={110} height={30} className="text-white" />
            </motion.div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleDark()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Auth Controls */}
            {isSignedIn ? (
              <div className="flex items-center gap-2">
                {isPremium && (
                  <div
                    title="Premium Member"
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 shadow-md shadow-yellow-500/30"
                  >
                    <Crown className="w-3.5 h-3.5 text-white fill-white" />
                    <span className="text-[10px] font-bold text-white hidden sm:inline tracking-wide">PREMIUM</span>
                  </div>
                )}
                <UserButton />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="px-4 py-1.5 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleMenu()}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search + Auth */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 space-y-3"
          >
            <SearchBar />
            {!isSignedIn && (
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <button className="flex-1 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors border border-border">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
