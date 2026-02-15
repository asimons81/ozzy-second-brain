import matter from 'gray-matter';
import { categories, getCategoryByKey } from '@/lib/categories';
import type { RecentsEntry, StorageAdapter } from '@/lib/storage';

const DEFAULT_RECENTS_LIMIT = 50;

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

  if (normalized.includes('..') || normalized.includes('/') || normalized.includes('\\')) {
    throw new Error('Invalid note slug.');
  }

  return normalized;
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function normalizeTags(raw: unknown): string[] {
  const source = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split(',')
      : [];

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const value of source) {
    if (typeof value !== 'string') continue;
    const next = normalizeTag(value);
    if (!next || seen.has(next)) continue;
    seen.add(next);
    tags.push(next);
  }

  return tags;
}

function titleFromMarkdown(content: string, fallback: string) {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match?.[1]) {
    return h1Match[1].trim();
  }

  return fallback.replace(/-/g, ' ');
}

function parseNoteMarkdown(markdown: string, slug: string) {
  const parsed = matter(markdown);
  const fm = parsed.data as Record<string, unknown>;
  const title =
    typeof fm.title === 'string' && fm.title.trim()
      ? fm.title.trim()
      : titleFromMarkdown(parsed.content, slug);
  const tags = normalizeTags(fm.tags);

  const createdAt =
    typeof fm.date === 'string' && !Number.isNaN(new Date(fm.date).getTime())
      ? fm.date
      : new Date().toISOString();

  const updatedAt =
    typeof fm.modified === 'string' && !Number.isNaN(new Date(fm.modified).getTime())
      ? fm.modified
      : new Date().toISOString();

  return {
    title,
    content: parsed.content,
    tags,
    createdAt,
    updatedAt,
  };
}

function buildMarkdownFromRow(row: {
  title: string;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}) {
  const tags = row.tags ? normalizeTags(JSON.parse(row.tags) as unknown) : [];

  const frontmatter: Record<string, unknown> = {
    title: row.title,
    date: row.created_at,
    modified: row.updated_at,
    tags,
  };

  return matter.stringify(row.content, frontmatter);
}

type NoteRow = {
  id: string;
  category: string;
  slug: string;
  title: string;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
};

type D1QueryRows<T> = { results: T[] };

export class D1Storage implements StorageAdapter {
  private seeded = false;
  private seedingPromise: Promise<void> | null = null;

  constructor(
    private readonly db: D1Database,
    private readonly fallbackReader?: Pick<StorageAdapter, 'readNote' | 'listNotes' | 'readRecents'>,
  ) {}

  private noteId(category: string, slug: string) {
    return `${assertKnownCategory(category)}:${assertSafeSlug(slug)}`;
  }

  private async ensureSeeded() {
    if (this.seeded) return;
    if (this.seedingPromise) {
      await this.seedingPromise;
      return;
    }

    this.seedingPromise = (async () => {
      const countRow = await this.db
        .prepare('SELECT COUNT(*) AS count FROM notes')
        .first<{ count: number }>();

      if ((countRow?.count ?? 0) > 0 || !this.fallbackReader) {
        this.seeded = true;
        return;
      }

      for (const category of categories.map((item) => item.key)) {
        const slugs = await this.fallbackReader.listNotes(category);
        for (const slug of slugs) {
          try {
            const markdown = await this.fallbackReader.readNote(category, slug);
            const parsed = parseNoteMarkdown(markdown, slug);
            const id = `${category}:${slug}`;
            await this.db
              .prepare(
                `INSERT OR IGNORE INTO notes (
                  id, category, slug, title, content, tags, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
              )
              .bind(
                id,
                category,
                slug,
                parsed.title,
                parsed.content,
                JSON.stringify(parsed.tags),
                parsed.createdAt,
                parsed.updatedAt,
              )
              .run();
          } catch {
            // Seed best-effort; malformed docs are ignored.
          }
        }
      }

      this.seeded = true;
    })();

    await this.seedingPromise;
  }

  async readNote(category: string, slug: string): Promise<string> {
    await this.ensureSeeded();

    const safeCategory = assertKnownCategory(category);
    const safeSlug = assertSafeSlug(slug);
    const id = `${safeCategory}:${safeSlug}`;

    const row = await this.db
      .prepare(
        'SELECT id, category, slug, title, content, tags, created_at, updated_at FROM notes WHERE id = ? LIMIT 1'
      )
      .bind(id)
      .first<NoteRow>();

    if (!row) {
      throw new Error('Note not found.');
    }

    return buildMarkdownFromRow(row);
  }

  async writeNote(category: string, slug: string, md: string): Promise<void> {
    await this.ensureSeeded();

    const safeCategory = assertKnownCategory(category);
    const safeSlug = assertSafeSlug(slug);
    const id = this.noteId(safeCategory, safeSlug);
    const parsed = parseNoteMarkdown(md, safeSlug);

    const existing = await this.db
      .prepare('SELECT created_at FROM notes WHERE id = ? LIMIT 1')
      .bind(id)
      .first<{ created_at: string }>();

    const createdAt = existing?.created_at ?? parsed.createdAt;
    const updatedAt = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO notes (id, category, slug, title, content, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           content = excluded.content,
           tags = excluded.tags,
           updated_at = excluded.updated_at`
      )
      .bind(
        id,
        safeCategory,
        safeSlug,
        parsed.title,
        parsed.content,
        JSON.stringify(parsed.tags),
        createdAt,
        updatedAt,
      )
      .run();
  }

  async deleteNote(category: string, slug: string): Promise<void> {
    await this.ensureSeeded();

    const id = this.noteId(category, slug);
    await this.db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
  }

  async listNotes(category: string): Promise<string[]> {
    await this.ensureSeeded();

    const safeCategory = assertKnownCategory(category);
    const rows = (await this.db
      .prepare('SELECT slug FROM notes WHERE category = ? ORDER BY slug ASC')
      .bind(safeCategory)
      .all<{ slug: string }>()) as D1QueryRows<{ slug: string }>;

    return rows.results.map((row) => row.slug);
  }

  async updateRecents(): Promise<void> {
    // Recents are derived from notes.updated_at in D1.
  }

  async readRecents(limit = DEFAULT_RECENTS_LIMIT): Promise<RecentsEntry[]> {
    await this.ensureSeeded();

    const rows = (await this.db
      .prepare(
        'SELECT category, slug, title, updated_at FROM notes ORDER BY datetime(updated_at) DESC LIMIT ?'
      )
      .bind(Math.max(1, Math.min(limit, 200)))
      .all<{ category: string; slug: string; title: string; updated_at: string }>()) as D1QueryRows<{
      category: string;
      slug: string;
      title: string;
      updated_at: string;
    }>;

    return rows.results.map((row) => ({
      key: `${row.category}/${row.slug}`,
      category: row.category,
      slug: row.slug,
      title: row.title,
      modifiedAt: row.updated_at,
      path: `/docs/${encodeURIComponent(row.category)}/${encodeURIComponent(row.slug)}`,
    }));
  }
}
