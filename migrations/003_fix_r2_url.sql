UPDATE songs SET
  audio_url = REPLACE(audio_url, 'pub-d91c61206a5c04989ca9921ce84a9104.r2.dev', 'pub-44ec9e1097054bae94216390e4d2ab45.r2.dev'),
  image_url = REPLACE(image_url, 'pub-d91c61206a5c04989ca9921ce84a9104.r2.dev', 'pub-44ec9e1097054bae94216390e4d2ab45.r2.dev');
UPDATE playlists SET
  image_url = REPLACE(image_url, 'pub-d91c61206a5c04989ca9921ce84a9104.r2.dev', 'pub-44ec9e1097054bae94216390e4d2ab45.r2.dev');
UPDATE albums SET
  image_url = REPLACE(image_url, 'pub-d91c61206a5c04989ca9921ce84a9104.r2.dev', 'pub-44ec9e1097054bae94216390e4d2ab45.r2.dev');
