import 'server-only';

import fs from 'fs';
import path from 'path';
import { getCategoryByKey } from '@/lib/categories';

export type StorageMode = 'local' | 'tmp';

export type RecentsEntry = {
  key: string;
  category: string;
  slug: string;
  title: string;
  modifiedAt: string;
  path: string;
};

export interface StorageAdapter {
  readNote(category: string, slug: string): string;
  writeNote(category: string, slug: string, md: string): void;
  listNotes(category: string): string[];
  updateRecents(entry: RecentsEntry): void;
}

export type StorageRuntimeInfo = {
  mode: StorageMode;
  dataDir: string;
  isEphemeral: boolean;
  warningBanner: string | null;
};

const DEFAULT_TMP_DIR = '/tmp/second-brain';
const RECENTS_LIMIT = 50;

function resolveStorageMode(): StorageMode {
  const configured = process.env.SECOND_BRAIN_STORAGE;
  if (configured === 'local' || configured === 'tmp') {
    return configured;
  }

  if (process.env.VERCEL) {
    return 'tmp';
  }

  return 'local';
}

function resolveDataDir(mode: StorageMode): string {
  const configured = process.env.SECOND_BRAIN_DATA_DIR;
  if (configured && configured.trim()) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }

  if (mode === 'tmp') {
    return DEFAULT_TMP_DIR;
  }

  return path.join(process.cwd(), 'content');
}

function assertKnownCategory(category: string) {
  const found = getCategoryByKey(category);
  if (!found) {
    throw new Error('Unknown category. Choose a configured category.');
  }
  return found.key;
}

function assertSafeSlug(slug: string) {
  const normalized = slug.trim();
  if (!normalized) {
    throw new Error('Invalid note slug.');
  }

  if (
    normalized.includes('..') ||
    normalized.includes('/') ||
    normalized.includes('\\')
  ) {
    throw new Error('Invalid note slug.');
  }

  return normalized;
}

function categoryDir(baseDir: string, category: string) {
  const key = assertKnownCategory(category);
  return path.join(baseDir, key);
}

function recentsPath(baseDir: string) {
  return path.join(baseDir, '.index', 'recents.json');
}

function readRecentsFromPath(filePath: string, limit = RECENTS_LIMIT): RecentsEntry[] {
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is RecentsEntry => {
        if (!item || typeof item !== 'object') return false;
        const candidate = item as Partial<RecentsEntry>;
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

function writeRecents(baseDir: string, entry: RecentsEntry) {
  const filePath = recentsPath(baseDir);
  const indexDir = path.dirname(filePath);
  fs.mkdirSync(indexDir, { recursive: true });

  const existing = readRecentsFromPath(filePath, RECENTS_LIMIT * 3);
  const merged = [entry, ...existing.filter((item) => item.key !== entry.key)]
    .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
    .slice(0, RECENTS_LIMIT);

  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
}

class LocalFsStorage implements StorageAdapter {
  constructor(private readonly baseDir: string) {}

  readNote(category: string, slug: string) {
    const safeCategory = assertKnownCategory(category);
    const safe = assertSafeSlug(slug);
    const filePath = path.join(categoryDir(this.baseDir, safeCategory), `${safe}.md`);
    if (!fs.existsSync(filePath)) {
      throw new Error('Note not found.');
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  writeNote(category: string, slug: string, md: string) {
    const safeCategory = assertKnownCategory(category);
    const safe = assertSafeSlug(slug);
    const dir = categoryDir(this.baseDir, safeCategory);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${safe}.md`), md, 'utf-8');
  }

  listNotes(category: string) {
    const safeCategory = assertKnownCategory(category);
    const dir = categoryDir(this.baseDir, safeCategory);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => name.replace(/\.md$/, ''));
  }

  updateRecents(entry: RecentsEntry) {
    writeRecents(this.baseDir, entry);
  }
}

class VercelEphemeralStorage extends LocalFsStorage {}

const mode = resolveStorageMode();
const dataDir = resolveDataDir(mode);
const adapter: StorageAdapter =
  mode === 'tmp'
    ? new VercelEphemeralStorage(dataDir)
    : new LocalFsStorage(dataDir);

export function getStorageAdapter() {
  return adapter;
}

export function getStorageRuntimeInfo(): StorageRuntimeInfo {
  const isEphemeral = mode === 'tmp';

  return {
    mode,
    dataDir,
    isEphemeral,
    warningBanner: isEphemeral
      ? 'Ephemeral storage: saves may not persist after redeploy/cold start. Configure persistent storage for durable saves.'
      : null,
  };
}

export function readRecents(limit = RECENTS_LIMIT) {
  return readRecentsFromPath(recentsPath(dataDir), limit);
}
