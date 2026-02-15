import 'server-only';

import * as fs from 'fs';
import * as path from 'path';
import { getCloudflareContext } from '@opennextjs/cloudflare/cloudflare-context';
import { D1Storage } from "./storage/d1";
import { getCategoryByKey } from '@/lib/categories';

export type StorageMode = 'local' | 'asset-readonly' | 'd1';

export type RecentsEntry = {
  key: string;
  category: string;
  slug: string;
  title: string;
  modifiedAt: string;
  path: string;
};

export interface StorageAdapter {
  readNote(category: string, slug: string): Promise<string>;
  writeNote(category: string, slug: string, md: string): Promise<void>;
  deleteNote(category: string, slug: string): Promise<void>;
  listNotes(category: string): Promise<string[]>;
  updateRecents(entry: RecentsEntry): Promise<void>;
  readRecents(limit?: number): Promise<RecentsEntry[]>;
}

export type StorageRuntimeInfo = {
  mode: StorageMode;
  dataDir: string;
  isEphemeral: boolean;
  writesAllowed: boolean;
  warningBanner: string | null;
};

const RECENTS_LIMIT = 50;

type ResolvedStorage = {
  adapter: StorageAdapter;
  info: StorageRuntimeInfo;
};

let resolvedStoragePromise: Promise<ResolvedStorage> | null = null;
const DEBUG_ENABLED = process.env.SECOND_BRAIN_DEBUG === '1';

function isBuildPhase() {
  const phase = process.env.NEXT_PHASE ?? "";
  return phase === "phase-production-build" || phase === "phase-production-export";
}



type AssetsBinding = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

function debugLog(message: string, data?: Record<string, unknown>) {
  if (!DEBUG_ENABLED) return;
  console.info(`[storage] ${message}`, data ?? {});
}

async function getCloudflareContextSafe() {
  try {
    return await getCloudflareContext({ async: true });
  } catch {
    return null;
  }
}

function resolveLocalDataDir() {
  const configured = process.env.SECOND_BRAIN_DATA_DIR;
  if (configured && configured.trim()) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
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
  constructor(
    private readonly baseDir: string,
    private readonly readOnly: boolean,
  ) {}

  async readNote(category: string, slug: string) {
    const safeCategory = assertKnownCategory(category);
    const safe = assertSafeSlug(slug);
    const filePath = path.join(categoryDir(this.baseDir, safeCategory), `${safe}.md`);
    if (!fs.existsSync(filePath)) {
      throw new Error('Note not found.');
    }
    debugLog('local readNote', { category: safeCategory, slug: safe, filePath });
    return fs.readFileSync(filePath, 'utf-8');
  }

  async writeNote(category: string, slug: string, md: string) {
    if (this.readOnly) {
      throw new Error('read-only deployment');
    }

    const safeCategory = assertKnownCategory(category);
    const safe = assertSafeSlug(slug);
    const dir = categoryDir(this.baseDir, safeCategory);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${safe}.md`), md, 'utf-8');
  }

  async deleteNote(category: string, slug: string) {
    if (this.readOnly) {
      throw new Error('read-only deployment');
    }

    const safeCategory = assertKnownCategory(category);
    const safe = assertSafeSlug(slug);
    const filePath = path.join(categoryDir(this.baseDir, safeCategory), `${safe}.md`);
    if (!fs.existsSync(filePath)) {
      throw new Error('Note not found.');
    }

    fs.unlinkSync(filePath);
  }

  async listNotes(category: string) {
    const safeCategory = assertKnownCategory(category);
    const dir = categoryDir(this.baseDir, safeCategory);
    if (!fs.existsSync(dir)) return [];
    const notes = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => name.replace(/\.md$/, ''));
    debugLog('local listNotes', { category: safeCategory, count: notes.length });
    return notes;
  }

  async updateRecents(entry: RecentsEntry) {
    if (this.readOnly) return;
    writeRecents(this.baseDir, entry);
  }

  async readRecents(limit = RECENTS_LIMIT) {
    return readRecentsFromPath(recentsPath(this.baseDir), limit);
  }
}

class CloudflareAssetsStorage implements StorageAdapter {
  private indexPromise: Promise<Record<string, string[]>> | null = null;

  constructor(private readonly assets: AssetsBinding) {}

  private assetUrl(pathname: string) {
    return new URL(pathname, 'https://assets.local');
  }

  private async fetchAsset(pathname: string) {
    const request = new Request(this.assetUrl(pathname).toString());
    const response = await this.assets.fetch(request);
    debugLog('assets fetch', { pathname, status: response.status });
    return response;
  }

  private async readIndex() {
    if (!this.indexPromise) {
      this.indexPromise = (async () => {
        const response = await this.fetchAsset('/content/index.json');
        if (!response.ok) {
          throw new Error(`Unable to read /content/index.json (status ${response.status})`);
        }

        const parsed = (await response.json()) as Record<string, unknown>;
        const index: Record<string, string[]> = {};

        for (const [key, value] of Object.entries(parsed)) {
          if (!Array.isArray(value)) continue;
          index[key] = value.filter((item): item is string => typeof item === 'string');
        }

        return index;
      })();
    }

    return this.indexPromise;
  }

  async readNote(category: string, slug: string) {
    const safeCategory = assertKnownCategory(category);
    const safeSlug = assertSafeSlug(slug);
    const pathname = `/content/${encodeURIComponent(safeCategory)}/${encodeURIComponent(safeSlug)}.md`;
    const response = await this.fetchAsset(pathname);

    if (response.status === 404) {
      throw new Error('Note not found.');
    }

    if (!response.ok) {
      throw new Error(`Unable to read note asset (status ${response.status})`);
    }

    return response.text();
  }

  async writeNote() {
    throw new Error('read-only deployment');
  }

  async deleteNote() {
    throw new Error('read-only deployment');
  }

  async listNotes(category: string) {
    const safeCategory = assertKnownCategory(category);
    const index = await this.readIndex();
    const notes = index[safeCategory] ?? [];
    debugLog('assets listNotes', { category: safeCategory, count: notes.length });
    return [...notes];
  }

  async updateRecents() {
    // Recents index is not writable in assets-backed runtime.
  }

  async readRecents() {
    return [];
  }
}

class MissingAssetsStorage implements StorageAdapter {
  async readNote(_category: string, _slug: string): Promise<string> {
    throw new Error('Note not found.');
  }

  async writeNote() {
    throw new Error('read-only deployment');
  }

  async deleteNote() {
    throw new Error('read-only deployment');
  }

  async listNotes() {
    return [];
  }

  async updateRecents() {
    // No-op in read-only fallback.
  }

  async readRecents() {
    return [];
  }
}

async function resolveCloudflareAssetsBinding() {
  const context = await getCloudflareContextSafe();
  if (!context) return null;

  if (context.env.ASSETS) {
    return context.env.ASSETS;
  }

  debugLog("cloudflare context missing ASSETS binding");
  return null;
}

async function resolveStorage(): Promise<ResolvedStorage> {
  const localDataDir = resolveLocalDataDir();

  // During `next build`, never touch Cloudflare bindings (D1/ASSETS) to avoid missing-migration failures.
  const phase = process.env.NEXT_PHASE || '';
  const inBuild = phase === 'phase-production-build' || phase.includes('build');
  if (inBuild) {
    const resolved: ResolvedStorage = {
      adapter: new LocalFsStorage(localDataDir, true),
      info: {
        mode: "local",
        dataDir: localDataDir,
        isEphemeral: false,
        writesAllowed: false,
        warningBanner: "read-only deployment",
      },
    };
    debugLog("runtime selected", { mode: resolved.info.mode, dataDir: resolved.info.dataDir, writesAllowed: resolved.info.writesAllowed, phase });
    return resolved;
  }

  let context: any = null;
  try {
    context = await getCloudflareContext({ async: true });
  } catch {
    context = null;
  }

  const hasD1 = Boolean(context?.env?.SECOND_BRAIN_DB);
  const hasAssets = Boolean(context?.env?.ASSETS);

  // Cloudflare runtime with D1 (persistent writes)
  if (hasD1) {
    const resolved: ResolvedStorage = {
      adapter: new D1Storage(
        context.env.SECOND_BRAIN_DB,
        hasAssets ? new CloudflareAssetsStorage(context.env.ASSETS) : undefined
      ),
      info: {
        mode: "d1",
        dataDir: "D1",
        isEphemeral: false,
        writesAllowed: true,
        warningBanner: null,
      },
    };
    debugLog("runtime selected", { mode: resolved.info.mode, dataDir: resolved.info.dataDir, writesAllowed: resolved.info.writesAllowed });
    return resolved;
  }

  // Cloudflare runtime with only ASSETS (read-only)
  if (hasAssets) {
    const resolved: ResolvedStorage = {
      adapter: new CloudflareAssetsStorage(context.env.ASSETS),
      info: {
        mode: "asset-readonly",
        dataDir: "/content (ASSETS)",
        isEphemeral: false,
        writesAllowed: false,
        warningBanner: "read-only deployment",
      },
    };
    debugLog("runtime selected", { mode: resolved.info.mode, dataDir: resolved.info.dataDir, writesAllowed: resolved.info.writesAllowed });
    return resolved;
  }

  // Local dev / non-Cloudflare runtime
  const resolved: ResolvedStorage = {
    adapter: new LocalFsStorage(localDataDir, false),
    info: {
      mode: "local",
      dataDir: localDataDir,
      isEphemeral: false,
      writesAllowed: true,
      warningBanner: null,
    },
  };
  debugLog("runtime selected", { mode: resolved.info.mode, dataDir: resolved.info.dataDir, writesAllowed: resolved.info.writesAllowed });
  return resolved;
}

async function getResolvedStorage() {
  if (!resolvedStoragePromise) {
    resolvedStoragePromise = resolveStorage();
  }

  return resolvedStoragePromise;
}

export async function getStorageAdapter() {
  return (await getResolvedStorage()).adapter;
}

export async function getStorageRuntimeInfo(): Promise<StorageRuntimeInfo> {
  return (await getResolvedStorage()).info;
}

export async function readRecents(limit = RECENTS_LIMIT) {
  const adapter = await getStorageAdapter();
  return adapter.readRecents(limit);
}
