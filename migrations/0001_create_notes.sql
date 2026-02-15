CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS notes_category_idx ON notes(category);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at);
CREATE UNIQUE INDEX IF NOT EXISTS notes_category_slug_unique_idx ON notes(category, slug);
