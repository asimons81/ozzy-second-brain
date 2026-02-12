import matter from 'gray-matter';
import { getStorageAdapter, getStorageRuntimeInfo } from '@/lib/storage';
import { getCategoryByKey } from '@/lib/categories';

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

function assertSafeExistingSlug(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    return null;
  }
  return trimmed;
}

function assertCategory(category: string) {
  const found = getCategoryByKey(category);
  if (!found) {
    throw new Error('Unknown category');
  }
  return found;
}

function noteRoute(category: string, slug: string) {
  return `/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}

function upsertRecents(category: string, slug: string, title: string, modifiedAt: string) {
  getStorageAdapter().updateRecents({
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
    const storage = getStorageAdapter();
    const category = assertCategory(input.category).key;

    const baseSlug = sanitizeSlug(title);
    let slug = baseSlug;
    let counter = 2;

    const existing = new Set(storage.listNotes(category));
    while (existing.has(slug)) {
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

    storage.writeNote(category, slug, fileContent);
    upsertRecents(category, slug, title, date);

    return { success: true, href: noteRoute(category, slug), category, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create note.';
    const info = getStorageRuntimeInfo();
    if (info.isEphemeral) {
      return {
        success: false,
        error: `${message} Running in ephemeral mode (${info.dataDir}). Set SECOND_BRAIN_STORAGE=local and SECOND_BRAIN_DATA_DIR to enable durable saves.`,
      };
    }
    return { success: false, error: message };
  }
}

export function updateNoteOnDisk(input: UpdateNoteInput): NoteWriteResult {
  const title = input.title.trim();
  if (!title) {
    return { success: false, error: 'Title is required.' };
  }

  const slug = assertSafeExistingSlug(input.slug);
  if (!slug) {
    return { success: false, error: 'Invalid note slug.' };
  }

  try {
    const storage = getStorageAdapter();
    const category = assertCategory(input.category).key;
    const raw = storage.readNote(category, slug);
    const parsed = matter(raw);
    const now = new Date().toISOString();

    const nextData = {
      ...parsed.data,
      title,
      tags: parseTags(input.tags),
      modified: now,
    };

    const nextContent = matter.stringify(input.body, nextData);
    storage.writeNote(category, slug, nextContent);
    upsertRecents(category, slug, title, now);

    return { success: true, href: noteRoute(category, slug), category, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save note.';
    const info = getStorageRuntimeInfo();
    if (info.isEphemeral) {
      return {
        success: false,
        error: `${message} Running in ephemeral mode (${info.dataDir}). Set SECOND_BRAIN_STORAGE=local and SECOND_BRAIN_DATA_DIR to enable durable saves.`,
      };
    }
    return { success: false, error: message };
  }
}
