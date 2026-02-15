import matter from 'gray-matter';
import { getStorageAdapter, getStorageRuntimeInfo } from '@/lib/storage';
import { getCategoryByKey } from '@/lib/categories';
import { normalizeTag } from '@/lib/brain';

export type CreateNoteInput = {
  title: string;
  category: string;
  tags?: string;
  body?: string;
  author?: 'user' | 'agent';
  requestReview?: boolean;
  slug?: string;
};

export type UpdateNoteInput = {
  category: string;
  slug: string;
  title: string;
  tags?: string;
  body: string;
};

export type DeleteNoteInput = {
  category: string;
  slug: string;
};

export type NoteWriteResult =
  | { success: true; href: string; category: string; slug: string }
  | { success: false; error: string };

function parseTags(raw?: string) {
  if (!raw) return [] as string[];

  const seen = new Set<string>();

  return raw
    .split(',')
    .map((tag) => normalizeTag(tag))
    .filter(Boolean)
    .filter((tag) => {
      if (seen.has(tag)) return false;
      seen.add(tag);
      return true;
    });
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

async function upsertRecents(category: string, slug: string, title: string, modifiedAt: string) {
  const storage = await getStorageAdapter();
  await storage.updateRecents({
    key: `${category}/${slug}`,
    category,
    slug,
    title,
    modifiedAt,
    path: noteRoute(category, slug),
  });
}

function renderRuntimeError(message: string, dataDir: string) {
  return `${message} Running in read-only mode (${dataDir}). Configure D1 for durable writes in Cloudflare.`;
}

export async function createNoteOnDisk(input: CreateNoteInput): Promise<NoteWriteResult> {
  const title = input.title.trim();
  if (!title) {
    return { success: false, error: 'Title is required.' };
  }

  try {
    const storage = await getStorageAdapter();
    const category = assertCategory(input.category).key;

    const baseSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    let slug = baseSlug;
    let counter = 2;

    const existing = new Set(await storage.listNotes(category));
    if (!input.slug) {
      while (existing.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
      }
    }

    const tags = parseTags(input.tags);
    const date = new Date().toISOString();
    const frontmatter: Record<string, unknown> = {
      title,
      date,
      modified: date,
      tags,
    };
    if (input.author) {
      frontmatter.author = input.author;
    }
    if (input.requestReview) {
      frontmatter.review_status = 'pending';
    }
    const fileContent = matter.stringify(input.body?.trim() ?? '', frontmatter);

    await storage.writeNote(category, slug, fileContent);
    await upsertRecents(category, slug, title, date);

    return { success: true, href: noteRoute(category, slug), category, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create note.';
    const info = await getStorageRuntimeInfo();
    if (!info.writesAllowed) {
      return { success: false, error: renderRuntimeError(message, info.dataDir) };
    }
    return { success: false, error: message };
  }
}

export async function updateNoteOnDisk(input: UpdateNoteInput): Promise<NoteWriteResult> {
  const title = input.title.trim();
  if (!title) {
    return { success: false, error: 'Title is required.' };
  }

  const slug = assertSafeExistingSlug(input.slug);
  if (!slug) {
    return { success: false, error: 'Invalid note slug.' };
  }

  try {
    const storage = await getStorageAdapter();
    const category = assertCategory(input.category).key;
    const raw = await storage.readNote(category, slug);
    const parsed = matter(raw);
    const now = new Date().toISOString();

    const nextData = {
      ...parsed.data,
      title,
      tags: parseTags(input.tags),
      modified: now,
    };

    const nextContent = matter.stringify(input.body, nextData);
    await storage.writeNote(category, slug, nextContent);
    await upsertRecents(category, slug, title, now);

    return { success: true, href: noteRoute(category, slug), category, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save note.';
    const info = await getStorageRuntimeInfo();
    if (!info.writesAllowed) {
      return { success: false, error: renderRuntimeError(message, info.dataDir) };
    }
    return { success: false, error: message };
  }
}

export async function deleteNoteOnDisk(input: DeleteNoteInput): Promise<NoteWriteResult> {
  const slug = assertSafeExistingSlug(input.slug);
  if (!slug) {
    return { success: false, error: 'Invalid note slug.' };
  }

  try {
    const storage = await getStorageAdapter();
    const category = assertCategory(input.category).key;
    await storage.deleteNote(category, slug);

    return { success: true, href: `/docs/${encodeURIComponent(category)}`, category, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete note.';
    const info = await getStorageRuntimeInfo();
    if (!info.writesAllowed) {
      return { success: false, error: renderRuntimeError(message, info.dataDir) };
    }
    return { success: false, error: message };
  }
}

export function toSafeSlug(value: string) {
  return sanitizeSlug(value);
}
