/**
 * ESHANI Static Data
 * Images and audio now served from Cloudflare R2.
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image: string;
  audioUrl: string;
  youtubeId?: string;
  isPremium?: boolean;
  duration: number;
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

// ── R2 helpers ────────────────────────────────────────────────────────────────
const R2 = 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev';
const cover = (slug: string) => `${R2}/covers/${slug}.jpg`;
const audio = (slug: string) => `${R2}/songs/${slug}.mp3`;

// ── Artist photos — mapped to R2 covers until dedicated artist photos are uploaded ──
// Replace these values once real artist/press photos are uploaded to R2 as covers/artist-*.jpg
export const ESHANI_PHOTOS = {
  hero:     cover('not-your-typical-brown-girl'),
  stage:    cover('freedom'),
  close:    cover('babycakes'),
  outdoor:  cover('asali-banna'),
  smile:    cover('freak'),
  artistic: cover('hazy'),
  warm:     cover('right-or-wrong'),
  profile:  cover('pretty-face'),
} as const;

// ── Song catalog ──────────────────────────────────────────────────────────────
export const SONGS_CATALOG: Track[] = [
  { id: 's-1', title: 'SWAY',                       artist: 'ESHANI',                      album: 'Asali',         image: cover('sway'),                        audioUrl: audio('sway'),                        youtubeId: 'bKucvURJtaY', isPremium: false, duration: 202, plays: 3200000, genre: 'R&B / Pop',       releaseDate: '2025-06-01' },
  { id: 's-2', title: 'Asali Banna',                artist: 'ESHANI',                      album: 'Asali',         image: cover('asali-banna'),                 audioUrl: audio('asali-banna'),                 youtubeId: 'qOJQKYHYxjI', isPremium: false, duration: 185, plays: 2100000, genre: 'Kannada Hip-Hop', releaseDate: '2024-03-15' },
  { id: 's-3', title: 'Right or Wrong',             artist: 'ESHANI',                      album: 'Between Worlds',image: cover('right-or-wrong'),              audioUrl: audio('right-or-wrong'),              youtubeId: 'q5KYu2QaYsI', isPremium: false, duration: 228, plays: 1850000, genre: 'Pop',             releaseDate: '2023-07-20' },
  { id: 's-4', title: 'Not Your Typical Brown Girl',artist: 'ESHANI',                      album: 'Between Worlds',image: cover('not-your-typical-brown-girl'), audioUrl: audio('not-your-typical-brown-girl'), youtubeId: 'bHNkcv5st6c', isPremium: false, duration: 213, plays: 4800000, genre: 'Hip-Hop',         releaseDate: '2021-11-05' },
  { id: 's-5', title: 'HAZY',                       artist: 'ESHANI',                      album: 'Free',          image: cover('hazy'),                        audioUrl: audio('hazy'),                        youtubeId: '2pmyXn9SXQ4', isPremium: true,  duration: 200, plays: 980000,  genre: 'Pop',             releaseDate: '2020-09-10' },
  { id: 's-6', title: 'Pretty Face',                artist: 'ESHANI',                      album: 'Free',          image: cover('pretty-face'),                 audioUrl: audio('pretty-face'),                 youtubeId: 'jCQ1yzCLB2E', isPremium: true,  duration: 192, plays: 1400000, genre: 'Pop',             releaseDate: '2021-02-14' },
  { id: 's-7', title: 'Freedom',                    artist: 'ESHANI feat. Vasuki Vaibhav', album: 'Between Worlds',image: cover('freedom'),                     audioUrl: audio('freedom'),                     youtubeId: 'Prbcd-J2Mjg', isPremium: false, duration: 241, plays: 2600000, genre: 'Indie Pop',       releaseDate: '2022-01-26' },
  { id: 's-8', title: 'Babycakes',                  artist: 'ESHANI',                      album: 'Between Worlds',image: cover('babycakes'),                   audioUrl: audio('babycakes'),                   youtubeId: 'lPHTraV4BnI', isPremium: false, duration: 208, plays: 1750000, genre: 'R&B',             releaseDate: '2022-06-18' },
  { id: 's-9', title: 'FREAK',                      artist: 'ESHANI',                      album: 'Free',          image: cover('freak'),                       audioUrl: audio('freak'),                       youtubeId: 'lYHg4gDwlpA', isPremium: false, duration: 195, plays: 3500000, genre: 'Pop',             releaseDate: '2020-06-01' },
];

const byId = (...ids: string[]) =>
  ids.map((id) => SONGS_CATALOG.find((s) => s.id === id)!).filter(Boolean);

export const FEATURED_SONGS: Track[]    = byId('s-1', 's-4', 's-9', 's-7', 's-2', 's-3', 's-8', 's-6');
export const TOP_PICKS: Track[]         = byId('s-9', 's-4', 's-1', 's-7', 's-2', 's-8');
export const RECENT_RELEASES: Track[]   = byId('s-1', 's-5', 's-9', 's-2', 's-3', 's-4');
export const ALL_SONGS: Track[]         = SONGS_CATALOG;

export const ALBUMS: Album[] = [
  { id: 'al-1', title: 'Asali',         image: cover('sway'),         releaseDate: '2024-03-15', trackCount: 2, duration: 387,  description: "ESHANI's latest era — blending Kannada roots with modern R&B.",         songIds: ['s-1','s-2']           },
  { id: 'al-2', title: 'Between Worlds',image: cover('freedom'),      releaseDate: '2022-06-18', trackCount: 4, duration: 890,  description: 'A cross-cultural journey exploring identity, freedom, and love.',         songIds: ['s-3','s-4','s-7','s-8']},
  { id: 'al-3', title: 'Free',          image: cover('freak'),        releaseDate: '2020-09-10', trackCount: 3, duration: 587,  description: "ESHANI's debut collection — bold, fearless, and unapologetically her own.", songIds: ['s-5','s-6','s-9']    },
];

export const COLLECTIONS: Collection[] = [
  { id: 'col-1', name: 'Best of ESHANI',     description: 'The essential playlist',          image: cover('not-your-typical-brown-girl'), songIds: ['s-4','s-9','s-1','s-7'] },
  { id: 'col-2', name: 'Chill Vibes',        description: 'Smooth, laid-back ESHANI',        image: cover('babycakes'),                   songIds: ['s-8','s-7','s-2']       },
  { id: 'col-3', name: 'High Energy',        description: 'ESHANI at her most powerful',      image: cover('freak'),                       songIds: ['s-9','s-4','s-1','s-3'] },
  { id: 'col-4', name: 'Kannada Pride',      description: "ESHANI's Kannada language tracks", image: cover('asali-banna'),                 songIds: ['s-2','s-3']             },
  { id: 'col-5', name: 'Premium Exclusives', description: 'Platform-only releases',           image: cover('hazy'),                        songIds: ['s-5','s-6']             },
];

export const FEATURED_PLAYLISTS: Playlist[] = [
  { id: 'pl-1', title: 'ESHANI Essentials',   description: 'The must-hear tracks — start here', image: cover('not-your-typical-brown-girl'), trackCount: 9, songIds: ['s-4','s-9','s-1','s-7','s-2','s-3','s-8','s-6','s-5'], curator: 'ESHANI', mood: 'Essential'  },
  { id: 'pl-2', title: 'Late Night Sessions',  description: 'Moody, introspective ESHANI',       image: cover('hazy'),                        trackCount: 4, songIds: ['s-5','s-8','s-6','s-2'],                              curator: 'ESHANI', mood: 'Moody'     },
  { id: 'pl-3', title: 'Confidence Boost',    description: 'Bold tracks for bold days',          image: cover('freak'),                       trackCount: 4, songIds: ['s-4','s-9','s-3','s-1'],                              curator: 'ESHANI', mood: 'Energetic' },
  { id: 'pl-4', title: 'Cultural Fusion',     description: "Where East meets West",              image: cover('asali-banna'),                 trackCount: 3, songIds: ['s-2','s-7','s-3'],                                    curator: 'ESHANI', mood: 'Fusion'    },
  { id: 'pl-5', title: 'R&B Feels',           description: "ESHANI's smooth R&B side",           image: cover('babycakes'),                   trackCount: 3, songIds: ['s-8','s-1','s-6'],                                    curator: 'ESHANI', mood: 'Romantic'  },
  { id: 'pl-6', title: 'New Beginnings',      description: 'Fresh tracks and recent releases',   image: cover('right-or-wrong'),              trackCount: 3, songIds: ['s-1','s-2','s-3'],                                    curator: 'ESHANI', mood: 'Hopeful'   },
];

export const UPCOMING_RELEASES: UpcomingRelease[] = [
  { id: 'ur-1', title: 'Untitled Vol. 2', artist: 'ESHANI', image: cover('pretty-face'),     releaseDate: 'Sep 2025', genre: 'Pop / R&B',  preOrders: 12400 },
  { id: 'ur-2', title: 'Namma Ooru',      artist: 'ESHANI', image: cover('asali-banna'),     releaseDate: 'Oct 2025', genre: 'Kannada Pop', preOrders: 8900  },
  { id: 'ur-3', title: 'Chrome',          artist: 'ESHANI', image: cover('hazy'),            releaseDate: 'Nov 2025', genre: 'Electronic',  preOrders: 5400  },
  { id: 'ur-4', title: 'After Hours',     artist: 'ESHANI', image: cover('babycakes'),       releaseDate: 'Dec 2025', genre: 'R&B',         preOrders: 21200 },
  { id: 'ur-5', title: 'Wildflower',      artist: 'ESHANI', image: cover('freedom'),         releaseDate: 'Jan 2026', genre: 'Indie Pop',   preOrders: 3700  },
  { id: 'ur-6', title: 'Neon Soul',       artist: 'ESHANI', image: cover('right-or-wrong'),  releaseDate: 'Feb 2026', genre: 'Pop',         preOrders: 17800 },
];

export const TRENDING_ARTISTS: Artist[] = [
  { id: 'ar-1', name: 'ESHANI', image: cover('not-your-typical-brown-girl'), followers: 2000000, genre: 'Indie Pop / R&B', verified: true },
];
