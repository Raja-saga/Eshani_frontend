import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Public-readable subset of settings (no admin email, no contact toggle)
const PUBLIC_KEYS = [
  'platform_name',
  'instagram_url',
  'youtube_url',
  'spotify_url',
  'twitter_url',
  'apple_music_url',
  'new_release_banner',
  'hero_image',
  'eshani_hero_image',
];

const DEFAULTS: Record<string, string> = {
  platform_name:     'ESHANI',
  instagram_url:     '',
  youtube_url:       '',
  spotify_url:       'https://open.spotify.com/artist/4CQMCs1zM49VQiI6Og0VWg',
  twitter_url:       '',
  apple_music_url:   '',
  new_release_banner: 'false',
  hero_image:        '',
  eshani_hero_image: '',
};

export async function GET() {
  try {
    const rows = await query<{ key: string; value: string }>(
      `SELECT key, value FROM settings WHERE key IN (${PUBLIC_KEYS.map(() => '?').join(',')})`,
      PUBLIC_KEYS
    );
    const map: Record<string, string> = { ...DEFAULTS };
    for (const { key, value } of rows) map[key] = value;
    return NextResponse.json({ settings: map }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch {
    return NextResponse.json({ settings: DEFAULTS });
  }
}
