-- Collections table (curated song groupings by admin)
CREATE TABLE IF NOT EXISTS collections (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collection_songs (
  collection_id TEXT    NOT NULL,
  song_id       TEXT    NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, song_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id)       REFERENCES songs(id)       ON DELETE CASCADE
);

-- Seed default collections from mock data
INSERT OR IGNORE INTO collections (id, name, description, image_url) VALUES
  ('col-1', 'Best of ESHANI',     'The essential playlist',          'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/not-your-typical-brown-girl.jpg'),
  ('col-2', 'Chill Vibes',        'Smooth, laid-back ESHANI',        'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/babycakes.jpg'),
  ('col-3', 'High Energy',        'ESHANI at her most powerful',     'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/freak.jpg'),
  ('col-4', 'Kannada Pride',      "ESHANI's Kannada language tracks",'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/asali-banna.jpg'),
  ('col-5', 'Premium Exclusives', 'Platform-only releases',          'https://pub-44ec9e1097054bae94216390e4d2ab45.r2.dev/covers/hazy.jpg');

INSERT OR IGNORE INTO collection_songs (collection_id, song_id, position) VALUES
  ('col-1','s-4',1),('col-1','s-9',2),('col-1','s-1',3),('col-1','s-7',4),
  ('col-2','s-8',1),('col-2','s-7',2),('col-2','s-2',3),
  ('col-3','s-9',1),('col-3','s-4',2),('col-3','s-1',3),('col-3','s-3',4),
  ('col-4','s-2',1),('col-4','s-3',2),
  ('col-5','s-5',1),('col-5','s-6',2);
