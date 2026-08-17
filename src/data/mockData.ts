/**
 * ESHANI Mock Data — real songs, real artist photos
 */

// ── Track Interface ───────────────────────────────────────────────────────────
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image: string;
  audioUrl?: string;
  youtubeId?: string;    // YouTube video ID — embed for free playback
  isPremium?: boolean;   // true = platform-exclusive, subscription required
  duration: number;      // seconds
  plays?: number;
  genre?: string;
  releaseDate?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followers: number;
  genre: string;
  verified?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  image: string;
  trackCount: number;
  songIds?: string[];
  curator?: string;
  mood?: string;
}

export interface UpcomingRelease {
  id: string;
  title: string;
  artist: string;
  image: string;
  releaseDate: string;
  genre: string;
  preOrders?: number;
}

export interface Album {
  id: string;
  title: string;
  image: string;
  releaseDate: string;
  trackCount: number;
  duration: number;
  description?: string;
  songIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  songIds: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const yt = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

// ── Real ESHANI Artist Photos (VoyageLA CDN — public) ─────────────────────────
export const ESHANI_PHOTOS = {
  hero:     'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-PersonalEshaniMusic__IMG1564_1666688575003-e1667870549464-1000x600.jpg',
  stage:    'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-EshaniMusic__IMG1550_1666688846458.jpg',
  close:    'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-EshaniMusic__IMG1553_1666688672466.jpg',
  outdoor:  'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-EshaniMusic__IMG1558_1666688732404.jpg',
  smile:    'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-EshaniMusic__IMG3060_1666688803013.jpg',
  artistic: 'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-EshaniMusic__IMG3061_1666688696664.jpg',
  warm:     'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-EshaniMusic__IMG3062_1666688711440.jpg',
  profile:  'https://cdn.voyagela.com/wp-content/uploads/2022/11/c-EshaniMusic__IMG4172_1666688773758.jpg',
};

// ── Real ESHANI Songs — Master Catalog ───────────────────────────────────────
// YouTube IDs verified from ESHANI's official channel: youtube.com/channel/UCBE-u957n8OCA66RHIb-EyA
export const SONGS_CATALOG: Track[] = [
  {
    id: 's-1',
    title: 'SWAY',
    artist: 'ESHANI',
    album: 'Asali',
    image: yt('bKucvURJtaY'),
    youtubeId: 'bKucvURJtaY',
    isPremium: false,
    duration: 202,
    plays: 3200000,
    genre: 'R&B / Pop',
    releaseDate: '2025-06-01',
  },
  {
    id: 's-2',
    title: 'Asali Banna',
    artist: 'ESHANI',
    album: 'Asali',
    image: yt('qOJQKYHYxjI'),
    youtubeId: 'qOJQKYHYxjI',
    isPremium: false,
    duration: 185,
    plays: 2100000,
    genre: 'Kannada Hip-Hop',
    releaseDate: '2024-03-15',
  },
  {
    id: 's-3',
    title: 'Right or Wrong',
    artist: 'ESHANI',
    album: 'Between Worlds',
    image: yt('q5KYu2QaYsI'),
    youtubeId: 'q5KYu2QaYsI',
    isPremium: false,
    duration: 228,
    plays: 1850000,
    genre: 'Pop',
    releaseDate: '2023-07-20',
  },
  {
    id: 's-4',
    title: 'Not Your Typical Brown Girl',
    artist: 'ESHANI',
    album: 'Between Worlds',
    image: yt('bHNkcv5st6c'),
    youtubeId: 'bHNkcv5st6c',
    isPremium: false,
    duration: 213,
    plays: 4800000,
    genre: 'Hip-Hop',
    releaseDate: '2021-11-05',
  },
  {
    id: 's-5',
    title: 'HAZY',
    artist: 'ESHANI',
    album: 'Free',
    image: yt('2pmyXn9SXQ4'),
    youtubeId: '2pmyXn9SXQ4',
    isPremium: true,
    duration: 200,
    plays: 980000,
    genre: 'Pop',
    releaseDate: '2020-09-10',
  },
  {
    id: 's-6',
    title: 'Pretty Face',
    artist: 'ESHANI',
    album: 'Free',
    image: yt('jCQ1yzCLB2E'),
    youtubeId: 'jCQ1yzCLB2E',
    isPremium: true,
    duration: 192,
    plays: 1400000,
    genre: 'Pop',
    releaseDate: '2021-02-14',
  },
  {
    id: 's-7',
    title: 'Freedom',
    artist: 'ESHANI feat. Vasuki Vaibhav',
    album: 'Between Worlds',
    image: yt('Prbcd-J2Mjg'),
    youtubeId: 'Prbcd-J2Mjg',
    isPremium: false,
    duration: 241,
    plays: 2600000,
    genre: 'Indie Pop',
    releaseDate: '2022-01-26',
  },
  {
    id: 's-8',
    title: 'Babycakes',
    artist: 'ESHANI',
    album: 'Between Worlds',
    image: yt('lPHTraV4BnI'),
    youtubeId: 'lPHTraV4BnI',
    isPremium: false,
    duration: 208,
    plays: 1750000,
    genre: 'R&B',
    releaseDate: '2022-06-18',
  },
  {
    id: 's-9',
    title: 'FREAK',
    artist: 'ESHANI',
    album: 'Free',
    image: yt('lYHg4gDwlpA'),
    youtubeId: 'lYHg4gDwlpA',
    isPremium: false,
    duration: 195,
    plays: 3500000,
    genre: 'Pop',
    releaseDate: '2020-06-01',
  },
];

// ── Section Groupings ─────────────────────────────────────────────────────────
const byId = (...ids: string[]) => ids.map(id => SONGS_CATALOG.find(s => s.id === id)!).filter(Boolean);

export const FEATURED_SONGS: Track[] = byId('s-1', 's-4', 's-9', 's-7', 's-2', 's-3', 's-8', 's-6');

export const TOP_PICKS: Track[] = byId('s-9', 's-4', 's-1', 's-7', 's-2', 's-8');

export const RECENT_RELEASES: Track[] = byId('s-1', 's-5', 's-9', 's-2', 's-3', 's-4');

export const ALL_SONGS: Track[] = SONGS_CATALOG;

// ── Albums ────────────────────────────────────────────────────────────────────
export const ALBUMS: Album[] = [
  {
    id: 'al-1',
    title: 'Asali',
    image: ESHANI_PHOTOS.outdoor,
    releaseDate: '2024-03-15',
    trackCount: 2,
    duration: 387,
    description: 'ESHANI\'s latest era — blending Kannada roots with modern R&B and pop production.',
    songIds: ['s-1', 's-2'],
  },
  {
    id: 'al-2',
    title: 'Between Worlds',
    image: ESHANI_PHOTOS.stage,
    releaseDate: '2022-06-18',
    trackCount: 4,
    duration: 890,
    description: 'A cross-cultural journey exploring identity, freedom, and love across languages and genres.',
    songIds: ['s-3', 's-4', 's-7', 's-8'],
  },
  {
    id: 'al-3',
    title: 'Free',
    image: ESHANI_PHOTOS.artistic,
    releaseDate: '2020-09-10',
    trackCount: 3,
    duration: 587,
    description: 'ESHANI\'s debut collection — bold, fearless, and unapologetically her own.',
    songIds: ['s-5', 's-6', 's-9'],
  },
];

// ── Collections ───────────────────────────────────────────────────────────────
export const COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Best of ESHANI',
    description: 'The essential playlist — her greatest hits',
    image: ESHANI_PHOTOS.hero,
    songIds: ['s-4', 's-9', 's-1', 's-7'],
  },
  {
    id: 'col-2',
    name: 'Chill Vibes',
    description: 'Smooth, laid-back ESHANI tracks',
    image: ESHANI_PHOTOS.close,
    songIds: ['s-8', 's-7', 's-2'],
  },
  {
    id: 'col-3',
    name: 'High Energy',
    description: 'ESHANI at her most powerful',
    image: ESHANI_PHOTOS.smile,
    songIds: ['s-9', 's-4', 's-1', 's-3'],
  },
  {
    id: 'col-4',
    name: 'Kannada Pride',
    description: 'ESHANI\'s Kannada language tracks',
    image: ESHANI_PHOTOS.warm,
    songIds: ['s-2', 's-3'],
  },
  {
    id: 'col-5',
    name: 'Premium Exclusives',
    description: 'Platform-only ESHANI releases',
    image: ESHANI_PHOTOS.profile,
    songIds: ['s-5', 's-6'],
  },
];

// ── Featured Playlists ────────────────────────────────────────────────────────
export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    title: 'ESHANI Essentials',
    description: 'The must-hear tracks — start here',
    image: ESHANI_PHOTOS.hero,
    trackCount: 9,
    songIds: ['s-4', 's-9', 's-1', 's-7', 's-2', 's-3', 's-8', 's-6', 's-5'],
    curator: 'ESHANI',
    mood: 'Essential',
  },
  {
    id: 'pl-2',
    title: 'Late Night Sessions',
    description: 'Moody, introspective ESHANI',
    image: ESHANI_PHOTOS.artistic,
    trackCount: 4,
    songIds: ['s-5', 's-8', 's-6', 's-2'],
    curator: 'ESHANI',
    mood: 'Moody',
  },
  {
    id: 'pl-3',
    title: 'Confidence Boost',
    description: 'Bold tracks for bold days',
    image: ESHANI_PHOTOS.smile,
    trackCount: 4,
    songIds: ['s-4', 's-9', 's-3', 's-1'],
    curator: 'ESHANI',
    mood: 'Energetic',
  },
  {
    id: 'pl-4',
    title: 'Cultural Fusion',
    description: 'Where East meets West in ESHANI\'s sound',
    image: ESHANI_PHOTOS.outdoor,
    trackCount: 3,
    songIds: ['s-2', 's-7', 's-3'],
    curator: 'ESHANI',
    mood: 'Fusion',
  },
  {
    id: 'pl-5',
    title: 'R&B Feels',
    description: 'ESHANI\'s smooth R&B side',
    image: ESHANI_PHOTOS.close,
    trackCount: 3,
    songIds: ['s-8', 's-1', 's-6'],
    curator: 'ESHANI',
    mood: 'Romantic',
  },
  {
    id: 'pl-6',
    title: 'New Beginnings',
    description: 'Fresh tracks and recent releases',
    image: ESHANI_PHOTOS.warm,
    trackCount: 3,
    songIds: ['s-1', 's-2', 's-3'],
    curator: 'ESHANI',
    mood: 'Hopeful',
  },
];

// ── Upcoming Releases ─────────────────────────────────────────────────────────
export const UPCOMING_RELEASES: UpcomingRelease[] = [
  { id: 'ur-1', title: 'Untitled Vol. 2', artist: 'ESHANI', image: ESHANI_PHOTOS.profile, releaseDate: 'Sep 2025', genre: 'Pop / R&B', preOrders: 12400 },
  { id: 'ur-2', title: 'Namma Ooru', artist: 'ESHANI', image: ESHANI_PHOTOS.warm, releaseDate: 'Oct 2025', genre: 'Kannada Pop', preOrders: 8900 },
  { id: 'ur-3', title: 'Chrome', artist: 'ESHANI', image: ESHANI_PHOTOS.close, releaseDate: 'Nov 2025', genre: 'Electronic', preOrders: 5400 },
  { id: 'ur-4', title: 'After Hours', artist: 'ESHANI', image: ESHANI_PHOTOS.artistic, releaseDate: 'Dec 2025', genre: 'R&B', preOrders: 21200 },
  { id: 'ur-5', title: 'Wildflower', artist: 'ESHANI', image: ESHANI_PHOTOS.stage, releaseDate: 'Jan 2026', genre: 'Indie Pop', preOrders: 3700 },
  { id: 'ur-6', title: 'Neon Soul', artist: 'ESHANI', image: ESHANI_PHOTOS.outdoor, releaseDate: 'Feb 2026', genre: 'Pop', preOrders: 17800 },
];

// ── Trending Artists (ESHANI-only platform) ───────────────────────────────────
export const TRENDING_ARTISTS: Artist[] = [
  { id: 'ar-1', name: 'ESHANI', image: ESHANI_PHOTOS.hero, followers: 2000000, genre: 'Indie Pop / R&B', verified: true },
];
