DROP TABLE IF EXISTS idea_decisions_new;

CREATE TABLE idea_decisions_new (
  id TEXT PRIMARY KEY,
  idea_slug TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs-work', 'reverted')),
  reason TEXT,
  feedback TEXT,
  idea_title TEXT NOT NULL,
  decided_at TEXT NOT NULL,
  actor TEXT
);

INSERT INTO idea_decisions_new (id, idea_slug, decision, reason, feedback, idea_title, decided_at, actor)
SELECT id, idea_slug, decision, reason, feedback, idea_title, decided_at, actor
FROM idea_decisions;

DROP TABLE idea_decisions;

ALTER TABLE idea_decisions_new RENAME TO idea_decisions;

CREATE INDEX IF NOT EXISTS idea_decisions_idea_slug_idx ON idea_decisions(idea_slug);
CREATE INDEX IF NOT EXISTS idea_decisions_decided_at_idx ON idea_decisions(decided_at);
