CREATE TABLE IF NOT EXISTS idea_decisions (
  id TEXT PRIMARY KEY,
  idea_slug TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs-work')),
  reason TEXT,
  feedback TEXT,
  idea_title TEXT NOT NULL,
  decided_at TEXT NOT NULL,
  actor TEXT
);

CREATE INDEX IF NOT EXISTS idea_decisions_idea_slug_idx ON idea_decisions(idea_slug);
CREATE INDEX IF NOT EXISTS idea_decisions_decided_at_idx ON idea_decisions(decided_at);
