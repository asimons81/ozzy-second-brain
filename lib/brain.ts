import matter from 'gray-matter';
import { categories, getCategoryByKey } from '@/lib/categories';
import { getStorageAdapter, readRecents } from '@/lib/storage';

export interface Doc {
  slug: string;
  category: string;
  title: string;
  date?: string;
  modified?: string;
  content: string;
  excerpt?: string;
  type?: 'trend' | 'captions' | 'experiment' | string;
  video?: string;
  thumbnail?: string;
  prompt?: string;
  model?: string;
  seed?: number | string;
  tags?: string[];
  brief?: string;
  journal?: string;
  score?: number | string;
  source?: string;
  url?: string;
  author?: 'user' | 'agent';
  review_status?: 'pending' | 'reviewed';
  ai_review?: string;
}

export type ContentSource = 'storage';

function safeLog(message: string, data?: Record<string, unknown>) {
  if (process.env.SECOND_BRAIN_DEBUG !== '1') return;
  console.info(`[brain] ${message}`, data ?? {});
}

export function getContentSource(): ContentSource {
  return 'storage';
}

async function listDocSlugs(category: string): Promise<string[]> {
  const storage = await getStorageAdapter();
  const slugs = await storage.listNotes(category);
  safeLog('content list', { source: 'storage', category, count: slugs.length });
  return slugs;
}

async function readDocMarkdown(category: string, slug: string): Promise<string> {
  safeLog('content read', { source: 'storage', category, slug });
  const storage = await getStorageAdapter();
  return storage.readNote(category, slug);
}

export function getReadingStats(content: string) {
  const text = content.replace(/[#*_`~\[\]()>|]/g, '').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, readingTime };
}

export interface PaletteItem {
  title: string;
  subtitle?: string;
  href: string;
  group?: string;
}

function normalizeDate(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const asTs = new Date(value).getTime();
  if (Number.isNaN(asTs)) return undefined;
  return value;
}

export function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function normalizeTags(raw: unknown): string[] {
  const source = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split(',')
      : [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of source) {
    if (typeof value !== 'string') continue;
    const tag = normalizeTag(value);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    normalized.push(tag);
  }

  return normalized;
}

function excerptFor(content: string) {
  const cleaned = content.replace(/#+\s/g, '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return cleaned.length > 140 ? `${cleaned.slice(0, 140)}...` : cleaned;
}

function docTimestamp(doc: Doc) {
  const modifiedTs = doc.modified ? new Date(doc.modified).getTime() : 0;
  if (modifiedTs > 0) return modifiedTs;

  const dateTs = doc.date ? new Date(doc.date).getTime() : 0;
  if (dateTs > 0) return dateTs;

  return 0;
}

export function getCategories() {
  return categories.map((category) => category.key);
}

export async function getDocsByCategory(category: string): Promise<Doc[]> {
  const known = getCategoryByKey(category);
  if (!known) return [];

  const files = (await listDocSlugs(category)).map((slug) => `${slug}.md`);

  const docs = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace('.md', '');
      const fileContent = await readDocMarkdown(category, slug);
      const { data, content } = matter(fileContent);

      const fm = data as Record<string, unknown>;
      let title = (fm.title as string | undefined) ?? undefined;

      if (!title) {
        const h1Match = content.match(/^#\s+(.+)$/m);
        title = h1Match ? h1Match[1] : slug.replace(/-/g, ' ');
      }

      const baseDoc = fm as Partial<Doc>;

      return {
        ...baseDoc,
        slug,
        category,
        title,
        date: normalizeDate(baseDoc.date),
        modified: normalizeDate(baseDoc.modified),
        tags: normalizeTags(baseDoc.tags),
        content,
        excerpt: excerptFor(content),
      } satisfies Doc;
    })
  );

  return docs.sort((a, b) => {
    if (category === 'journal' || category === 'renders' || category === 'briefs') {
      return docTimestamp(b) - docTimestamp(a) || b.slug.localeCompare(a.slug);
    }

    return a.slug.localeCompare(b.slug);
  });
}

export async function getDoc(category: string, slug: string): Promise<Doc | null> {
  const known = getCategoryByKey(category);
  if (!known) return null;

  try {
    const fileContent = await readDocMarkdown(category, slug);
    const { data, content } = matter(fileContent);
    const fm = data as Record<string, unknown>;

    let title = (fm.title as string | undefined) ?? undefined;
    if (!title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      title = h1Match ? h1Match[1] : slug.replace(/-/g, ' ');
    }

    const baseDoc = fm as Partial<Doc>;

    return {
      ...baseDoc,
      slug,
      category,
      title,
      date: normalizeDate(baseDoc.date),
      modified: normalizeDate(baseDoc.modified),
      tags: normalizeTags(baseDoc.tags),
      content,
    };
  } catch {
    return null;
  }
}

export async function getAllDocs(): Promise<Doc[]> {
  const all: Doc[] = [];
  for (const category of getCategories()) {
    all.push(...(await getDocsByCategory(category)));
  }
  return all;
}

export async function getRecentDocs(limit = 12): Promise<Doc[]> {
  const indexed = await readRecents(limit * 2);
  if (indexed.length > 0) {
    const docs: Doc[] = [];

    for (const entry of indexed) {
      const doc = await getDoc(entry.category, entry.slug);
      if (doc) {
        docs.push(doc);
      }
      if (docs.length >= limit) {
        return docs;
      }
    }

    if (docs.length > 0) {
      return docs;
    }
  }

  const all = await getAllDocs();
  const withTs = all.map((doc) => ({ doc, ts: docTimestamp(doc) }));

  return withTs
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map((item) => item.doc);
}

export async function getAllPaletteItems(): Promise<PaletteItem[]> {
  const docs = await getAllDocs();
  return docs
    .map((doc) => ({
      title: doc.title,
      subtitle: doc.modified ?? doc.date ?? doc.slug,
      href: `/docs/${encodeURIComponent(doc.category)}/${encodeURIComponent(doc.slug)}`,
      group: `Docs/${doc.category}`,
    }))
    .sort((a, b) => (a.group ?? '').localeCompare(b.group ?? '') || a.title.localeCompare(b.title));
}

export async function getTagCounts() {
  const counts = new Map<string, number>();

  for (const doc of await getAllDocs()) {
    for (const tag of doc.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getDocsByTag(tag: string) {
  const normalized = normalizeTag(tag);
  if (!normalized) return [];

  return (await getAllDocs())
    .filter((doc) => (doc.tags ?? []).includes(normalized))
    .sort((a, b) => docTimestamp(b) - docTimestamp(a) || a.title.localeCompare(b.title));
}
