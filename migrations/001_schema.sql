-- ESHANI Platform — D1 Schema
-- Run: wrangler d1 execute eshani-db --file migrations/001_schema.sql

CREATE TABLE IF NOT EXISTS songs (
  id           TEXT    PRIMARY KEY,
  title        TEXT    NOT NULL,
  artist       TEXT    NOT NULL,
  album        TEXT,
  audio_url    TEXT    NOT NULL,
  image_url    TEXT    NOT NULL,
  duration     INTEGER NOT NULL,
  plays        INTEGER DEFAULT 0,
  genre        TEXT,
  is_premium   INTEGER DEFAULT 0,
  release_date TEXT,
  youtube_id   TEXT,
  created_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlists (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  curator     TEXT,
  mood        TEXT,
  is_official INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id TEXT    NOT NULL,
  song_id     TEXT    NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id)     REFERENCES songs(id)     ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS albums (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  release_date TEXT,
  description  TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS album_songs (
  album_id TEXT    NOT NULL,
  song_id  TEXT    NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (album_id, song_id),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id)  REFERENCES songs(id)  ON DELETE CASCADE
);

-- Stores per-user liked songs (Clerk user_id)
CREATE TABLE IF NOT EXISTS user_likes (
  user_id    TEXT NOT NULL,
  song_id    TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, song_id),
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS play_history (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   TEXT NOT NULL,
  song_id   TEXT NOT NULL,
  played_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- User-created playlists (per Clerk user)
CREATE TABLE IF NOT EXISTS user_playlists (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_playlist_songs (
  user_playlist_id TEXT    NOT NULL,
  song_id          TEXT    NOT NULL,
  position         INTEGER NOT NULL DEFAULT 0,
  added_at         TEXT    DEFAULT (datetime('now')),
  PRIMARY KEY (user_playlist_id, song_id),
  FOREIGN KEY (user_playlist_id) REFERENCES user_playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id)          REFERENCES songs(id)           ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_songs_genre     ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_plays     ON songs(plays DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_user ON play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_user   ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_user ON user_playlists(user_id);
