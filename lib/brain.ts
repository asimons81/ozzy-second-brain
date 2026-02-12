import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { categories, getCategoryByKey } from '@/lib/categories';
import { readRecents } from '@/lib/recents';

const BRAIN_DIR = path.join(process.cwd(), 'content');

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
  return categories
    .filter((category) => fs.existsSync(path.join(process.cwd(), category.dir)))
    .map((category) => category.key);
}

export function getDocsByCategory(category: string): Doc[] {
  const known = getCategoryByKey(category);
  if (!known) return [];

  const categoryPath = path.join(process.cwd(), known.dir);
  if (!fs.existsSync(categoryPath)) return [];

  const files = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.md'));

  return files
    .map((file) => {
      const filePath = path.join(categoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      const slug = file.replace('.md', '');

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
        content,
        excerpt: excerptFor(content),
      } satisfies Doc;
    })
    .sort((a, b) => {
      if (category === 'journal' || category === 'renders' || category === 'briefs') {
        return docTimestamp(b) - docTimestamp(a) || b.slug.localeCompare(a.slug);
      }

      return a.slug.localeCompare(b.slug);
    });
}

export function getDoc(category: string, slug: string): Doc | null {
  const known = getCategoryByKey(category);
  if (!known) return null;

  try {
    const filePath = path.join(process.cwd(), known.dir, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
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
      content,
    };
  } catch {
    return null;
  }
}

export function getAllDocs(): Doc[] {
  const all: Doc[] = [];
  for (const category of getCategories()) {
    all.push(...getDocsByCategory(category));
  }
  return all;
}

export function getRecentDocs(limit = 12): Doc[] {
  const indexed = readRecents(limit * 2);
  if (indexed.length > 0) {
    const docs: Doc[] = [];

    for (const entry of indexed) {
      const doc = getDoc(entry.category, entry.slug);
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

  const all = getAllDocs();
  const withTs = all.map((doc) => {
    const fallbackPath = path.join(BRAIN_DIR, doc.category, `${doc.slug}.md`);
    const fallbackTs = fs.existsSync(fallbackPath) ? fs.statSync(fallbackPath).mtimeMs : 0;

    return {
      doc,
      ts: docTimestamp(doc) || fallbackTs,
    };
  });

  return withTs
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map((item) => item.doc);
}

export function getAllPaletteItems(): PaletteItem[] {
  const docs = getAllDocs();
  return docs
    .map((doc) => ({
      title: doc.title,
      subtitle: doc.modified ?? doc.date ?? doc.slug,
      href: `/docs/${encodeURIComponent(doc.category)}/${encodeURIComponent(doc.slug)}`,
      group: doc.category,
    }))
    .sort((a, b) => (a.group ?? '').localeCompare(b.group ?? '') || a.title.localeCompare(b.title));
}
