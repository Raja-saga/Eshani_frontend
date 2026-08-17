/**
 * BottomNavigation Component
 * 
 * Mobile-only bottom navigation bar.
 * Features:
 * - Navigation menu items
 * - Active route highlighting
 * - Fixed positioning
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
} from 'lucide-react';
import { NAV_ITEMS } from '@/constants';

interface BottomNavigationProps {
  className?: string;
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-6 h-6" />,
  compass: <Compass className="w-6 h-6" />,
  library: <Library className="w-6 h-6" />,
  list: <ListMusic className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
};

/**
 * BottomNavigation Component
 * 
 * Props:
 * - className: Optional CSS classes
 * 
 * Features:
 * - Mobile-optimized navigation
 * - Touch-friendly buttons
 * - Active route highlighting
 * - Smooth animations
 * - Accessible ARIA labels
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 ${className}`}
    >
      {/* Navigation Items */}
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { if (isActive) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {iconMap[item.icon as keyof typeof iconMap] || (
                  <div className="w-6 h-6" />
                )}
              </motion.div>
              <span
                className={`text-xs font-semibold transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute bottom-0 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
