import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getCategoryByKey } from '@/lib/categories';
import { upsertRecent } from '@/lib/recents';

export type CreateNoteInput = {
  title: string;
  category: string;
  tags?: string;
  body?: string;
};

export type UpdateNoteInput = {
  category: string;
  slug: string;
  title: string;
  tags?: string;
  body: string;
};

export type NoteWriteResult =
  | { success: true; href: string; category: string; slug: string }
  | { success: false; error: string };

function parseTags(raw?: string) {
  if (!raw) return [] as string[];

  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, idx, arr) => arr.indexOf(tag) === idx);
}

function sanitizeSlug(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'untitled';
}

function assertCategory(category: string) {
  const found = getCategoryByKey(category);
  if (!found) {
    throw new Error('Unknown category');
  }
  return found;
}

function categoryDir(category: string) {
  const categoryDef = assertCategory(category);
  return path.join(process.cwd(), categoryDef.dir);
}

function noteRoute(category: string, slug: string) {
  return `/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}

function upsertRecents(category: string, slug: string, title: string, modifiedAt: string) {
  upsertRecent({
    key: `${category}/${slug}`,
    category,
    slug,
    title,
    modifiedAt,
    path: noteRoute(category, slug),
  });
}

export function createNoteOnDisk(input: CreateNoteInput): NoteWriteResult {
  const title = input.title.trim();
  if (!title) {
    return { success: false, error: 'Title is required.' };
  }

  try {
    const category = assertCategory(input.category).key;
    const dir = categoryDir(category);
    fs.mkdirSync(dir, { recursive: true });

    const baseSlug = sanitizeSlug(title);
    let slug = baseSlug;
    let counter = 2;

    while (fs.existsSync(path.join(dir, `${slug}.md`))) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const tags = parseTags(input.tags);
    const date = new Date().toISOString();
    const fileContent = matter.stringify(input.body?.trim() ?? '', {
      title,
      date,
      tags,
    });

    fs.writeFileSync(path.join(dir, `${slug}.md`), fileContent, 'utf-8');
    upsertRecents(category, slug, title, date);

    return { success: true, href: noteRoute(category, slug), category, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create note.';
    return { success: false, error: message };
  }
}

export function updateNoteOnDisk(input: UpdateNoteInput): NoteWriteResult {
  const title = input.title.trim();
  if (!title) {
    return { success: false, error: 'Title is required.' };
  }

  const slug = sanitizeSlug(input.slug);
  if (slug !== input.slug) {
    return { success: false, error: 'Invalid note slug.' };
  }

  try {
    const category = assertCategory(input.category).key;
    const dir = categoryDir(category);
    const filePath = path.join(dir, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'Note not found.' };
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(raw);
    const now = new Date().toISOString();

    const nextData = {
      ...parsed.data,
      title,
      tags: parseTags(input.tags),
      modified: now,
    };

    const nextContent = matter.stringify(input.body, nextData);
    fs.writeFileSync(filePath, nextContent, 'utf-8');
    upsertRecents(category, slug, title, now);

    return { success: true, href: noteRoute(category, slug), category, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save note.';
    return { success: false, error: message };
  }
}
