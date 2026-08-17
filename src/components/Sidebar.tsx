/**
 * Sidebar Component
 * 
 * Left sidebar navigation for desktop view.
 * Features:
 * - Navigation menu items
 * - Active route highlighting
 * - Playlist list
 * - Collapsible on smaller screens
 * - Smooth animations
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Compass,
  Library,
  ListMusic,
  Heart,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { NAV_ITEMS } from '@/constants';

interface SidebarProps {
  className?: string;
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  compass: <Compass className="w-5 h-5" />,
  library: <Library className="w-5 h-5" />,
  list: <ListMusic className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
};

/**
 * Sidebar Component
 * 
 * Props:
 * - className: Optional CSS classes
 * 
 * Features:
 * - Active route highlighting
 * - Icon-based navigation
 * - Playlist section with create button
 * - Smooth animations
 * - Accessible navigation
 */
const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const [isPlaylistsOpen, setIsPlaylistsOpen] = React.useState(true);

  // Sample playlists
  const playlists = [
    { id: '1', name: 'Workout Mix' },
    { id: '2', name: 'Chill Vibes' },
    { id: '3', name: 'Party Hits' },
    { id: '4', name: 'Study Focus' },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-64 bg-card border-r border-border overflow-y-auto ${className}`}
    >
      {/* Sidebar Content */}
      <div className="p-6 space-y-8">
        {/* Navigation Section */}
        <nav className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4">
            Menu
          </p>

          {NAV_ITEMS.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {iconMap[item.icon as keyof typeof iconMap] || (
                    <div className="w-5 h-5" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Playlists Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3">
            <button
              onClick={() => setIsPlaylistsOpen(!isPlaylistsOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>Playlists</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isPlaylistsOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>

            {/* Create Playlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              aria-label="Create new playlist"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Playlists List */}
          {isPlaylistsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              {playlists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/playlist/${playlist.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-all duration-200 group"
                  >
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-purple-600 group-hover:shadow-lg transition-shadow" />
                    <span className="truncate">{playlist.name}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Footer Info */}
        <div className="text-xs text-muted-foreground space-y-2 px-3">
          <p>ESHANI v1.0.0</p>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
