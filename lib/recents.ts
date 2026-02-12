import fs from 'fs';
import path from 'path';

export type RecentEntry = {
  key: string;
  category: string;
  slug: string;
  title: string;
  modifiedAt: string;
  path: string;
};

const RECENTS_DIR = path.join(process.cwd(), 'content', '.index');
const RECENTS_PATH = path.join(RECENTS_DIR, 'recents.json');

export function getRecentsFilePath() {
  return RECENTS_PATH;
}

export function readRecents(limit = 50): RecentEntry[] {
  if (!fs.existsSync(RECENTS_PATH)) return [];

  try {
    const raw = fs.readFileSync(RECENTS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is RecentEntry => {
        if (!item || typeof item !== 'object') return false;

        const candidate = item as Partial<RecentEntry>;
        return (
          typeof candidate.key === 'string' &&
          typeof candidate.category === 'string' &&
          typeof candidate.slug === 'string' &&
          typeof candidate.title === 'string' &&
          typeof candidate.modifiedAt === 'string' &&
          typeof candidate.path === 'string'
        );
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function upsertRecent(entry: RecentEntry, limit = 50) {
  fs.mkdirSync(RECENTS_DIR, { recursive: true });

  const existing = readRecents(limit * 3);
  const merged = [entry, ...existing.filter((item) => item.key !== entry.key)]
    .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
    .slice(0, limit);

  fs.writeFileSync(RECENTS_PATH, JSON.stringify(merged, null, 2));
}
