/**
 * ESHANI Type Definitions
 *
 * This file contains all TypeScript type and interface definitions used throughout the application.
 * It includes types for audio tracks, playlists, user data, and API responses.
 */

// Role Types
export type Role = 'LISTENER' | 'ADMIN';

// Audio Track Types
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  genre: string;
  plays: number;
  liked: boolean;
  youtubeId?: string;   // YouTube video ID for embedded playback
  isPremium?: boolean;  // true = platform-exclusive (requires subscription)
}

// Playlist Types
export interface Playlist {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  likedTracks: string[]; // Track IDs
  playlists: Playlist[];
}

// Player State Types
export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  queue: Track[];
  currentIndex: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  volume: number;
}

// Search Results Types
export interface SearchResults {
  tracks: Track[];
  playlists: Playlist[];
  artists: Artist[];
}

// Artist Types
export interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  verified: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  timestamp: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

// Filter Types
export interface FilterOptions {
  genre?: string;
  sortBy?: 'popular' | 'recent' | 'trending';
  limit?: number;
  offset?: number;
}
