/**
 * Application Constants
 * 
 * This file contains all constant values used throughout the application.
 * Includes navigation items, routes, API endpoints, and default values.
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const TIMEOUT = 30000; // milliseconds

// Navigation Routes
export const ROUTES = {
  home: '/',
  explore: '/explore',
  library: '/library',
  search: '/search',
  artist: '/artist',
  playlist: '/playlist',
  profile: '/profile',
  settings: '/settings',
} as const;

// Navigation Items for Sidebar
export const NAV_ITEMS = [
  { label: 'Home', href: ROUTES.home, icon: 'home' },
  { label: 'Explore', href: ROUTES.explore, icon: 'compass' },
  { label: 'Library', href: ROUTES.library, icon: 'library' },
  { label: 'My Playlists', href: '/playlists', icon: 'list' },
  { label: 'Liked Songs', href: '/liked', icon: 'heart' },
] as const;

// Music Genres
export const GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'Jazz',
  'Classical',
  'Electronic',
  'R&B',
  'Country',
  'Folk',
  'Metal',
  'Indie',
  'Latino',
] as const;

// Player Repeat Modes
export const REPEAT_MODES = {
  off: 'off',
  all: 'all',
  one: 'one',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  theme: 'eshani-theme',
  userPreferences: 'eshani-user-prefs',
  likedTracks: 'eshani-liked-tracks',
  recentSearches: 'eshani-recent-searches',
  playerState: 'eshani-player-state',
} as const;

// Breakpoints for Responsive Design
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
  wide: 1920,
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  quick: 150,
  normal: 300,
  slow: 500,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
} as const;

// Default Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_OFFSET: 0,
  MAX_LIMIT: 100,
} as const;

// Default Player Volume (0-1)
export const DEFAULT_VOLUME = 0.7;

// Debounce Delays (in milliseconds)
export const DEBOUNCE = {
  search: 300,
  resize: 200,
  scroll: 150,
} as const;
