CREATE TABLE IF NOT EXISTS upcoming_releases (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  artist       TEXT NOT NULL DEFAULT 'ESHANI',
  image_url    TEXT NOT NULL DEFAULT '',
  release_date TEXT,
  genre        TEXT DEFAULT '',
  pre_orders   INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
);

  