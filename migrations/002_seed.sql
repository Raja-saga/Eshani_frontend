-- ESHANI Platform — Seed Data
-- Run: wrangler d1 execute eshani-db --file migrations/002_seed.sql

-- ── Songs ────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO songs (id, title, artist, album, audio_url, image_url, duration, plays, genre, is_premium, release_date, youtube_id) VALUES
('s-1', 'SWAY', 'ESHANI', 'Asali',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/sway.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/sway.jpg',
 202, 3200000, 'R&B / Pop', 0, '2025-06-01', 'bKucvURJtaY'),

('s-2', 'Asali Banna', 'ESHANI', 'Asali',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/asali-banna.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/asali-banna.jpg',
 185, 2100000, 'Kannada Hip-Hop', 0, '2024-03-15', 'qOJQKYHYxjI'),

('s-3', 'Right or Wrong', 'ESHANI', 'Between Worlds',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/right-or-wrong.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/right-or-wrong.jpg',
 228, 1850000, 'Pop', 0, '2023-07-20', 'q5KYu2QaYsI'),

('s-4', 'Not Your Typical Brown Girl', 'ESHANI', 'Between Worlds',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/not-your-typical-brown-girl.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/not-your-typical-brown-girl.jpg',
 213, 4800000, 'Hip-Hop', 0, '2021-11-05', 'bHNkcv5st6c'),

('s-5', 'HAZY', 'ESHANI', 'Free',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/hazy.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/hazy.jpg',
 200, 980000, 'Pop', 1, '2020-09-10', '2pmyXn9SXQ4'),

('s-6', 'Pretty Face', 'ESHANI', 'Free',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/pretty-face.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/pretty-face.jpg',
 192, 1400000, 'Pop', 1, '2021-02-14', 'jCQ1yzCLB2E'),

('s-7', 'Freedom', 'ESHANI feat. Vasuki Vaibhav', 'Between Worlds',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/freedom.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/freedom.jpg',
 241, 2600000, 'Indie Pop', 0, '2022-01-26', 'Prbcd-J2Mjg'),

('s-8', 'Babycakes', 'ESHANI', 'Between Worlds',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/babycakes.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/babycakes.jpg',
 208, 1750000, 'R&B', 0, '2022-06-18', 'lPHTraV4BnI'),

('s-9', 'FREAK', 'ESHANI', 'Free',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/songs/freak.mp3',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/freak.jpg',
 195, 3500000, 'Pop', 0, '2020-06-01', 'lYHg4gDwlpA');

-- ── Albums ───────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO albums (id, title, image_url, release_date, description) VALUES
('al-1', 'Asali',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/sway.jpg',
 '2024-03-15', 'ESHANI''s latest era — blending Kannada roots with modern R&B and pop production.'),

('al-2', 'Between Worlds',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/freedom.jpg',
 '2022-06-18', 'A cross-cultural journey exploring identity, freedom, and love across languages and genres.'),

('al-3', 'Free',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/freak.jpg',
 '2020-09-10', 'ESHANI''s debut collection — bold, fearless, and unapologetically her own.');

INSERT OR IGNORE INTO album_songs (album_id, song_id, position) VALUES
('al-1', 's-1', 1), ('al-1', 's-2', 2),
('al-2', 's-3', 1), ('al-2', 's-4', 2), ('al-2', 's-7', 3), ('al-2', 's-8', 4),
('al-3', 's-5', 1), ('al-3', 's-6', 2), ('al-3', 's-9', 3);

-- ── Official Playlists ───────────────────────────────────────────────────────
INSERT OR IGNORE INTO playlists (id, title, description, image_url, curator, mood, is_official) VALUES
('pl-1', 'ESHANI Essentials', 'The must-hear tracks — start here',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/not-your-typical-brown-girl.jpg',
 'ESHANI', 'Essential', 1),

('pl-2', 'Late Night Sessions', 'Moody, introspective ESHANI',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/hazy.jpg',
 'ESHANI', 'Moody', 1),

('pl-3', 'Confidence Boost', 'Bold tracks for bold days',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/freak.jpg',
 'ESHANI', 'Energetic', 1),

('pl-4', 'Cultural Fusion', 'Where East meets West in ESHANI''s sound',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/asali-banna.jpg',
 'ESHANI', 'Fusion', 1),

('pl-5', 'R&B Feels', 'ESHANI''s smooth R&B side',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/babycakes.jpg',
 'ESHANI', 'Romantic', 1),

('pl-6', 'New Beginnings', 'Fresh tracks and recent releases',
 'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/right-or-wrong.jpg',
 'ESHANI', 'Hopeful', 1);

INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position) VALUES
('pl-1', 's-4', 1), ('pl-1', 's-9', 2), ('pl-1', 's-1', 3), ('pl-1', 's-7', 4),
('pl-1', 's-2', 5), ('pl-1', 's-3', 6), ('pl-1', 's-8', 7), ('pl-1', 's-6', 8), ('pl-1', 's-5', 9),
('pl-2', 's-5', 1), ('pl-2', 's-8', 2), ('pl-2', 's-6', 3), ('pl-2', 's-2', 4),
('pl-3', 's-4', 1), ('pl-3', 's-9', 2), ('pl-3', 's-3', 3), ('pl-3', 's-1', 4),
('pl-4', 's-2', 1), ('pl-4', 's-7', 2), ('pl-4', 's-3', 3),
('pl-5', 's-8', 1), ('pl-5', 's-1', 2), ('pl-5', 's-6', 3),
('pl-6', 's-1', 1), ('pl-6', 's-2', 2), ('pl-6', 's-3', 3);
