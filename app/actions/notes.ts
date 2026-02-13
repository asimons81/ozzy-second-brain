'use server';

import { revalidatePath } from 'next/cache';
import { categories } from '@/lib/categories';
import { getStorageRuntimeInfo } from '@/lib/storage';
import { rebuildGraphIndex } from '@/lib/graph';
import {
  createNoteOnDisk,
  updateNoteOnDisk,
  type CreateNoteInput,
  type UpdateNoteInput,
} from '@/lib/notes';

export type { CreateNoteInput, UpdateNoteInput };
export type NoteActionResult =
  | { ok: true; href: string }
  | { ok: false; error: string };

function safeRevalidate(pathname: string) {
  try {
    revalidatePath(pathname);
  } catch {
    // Revalidation context is only present during Next request execution.
  }
}

function revalidateNotePaths(category: string, slug: string) {
  safeRevalidate('/');
  safeRevalidate(`/docs/${category}`);
  safeRevalidate(`/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`);
  safeRevalidate('/tags');
  safeRevalidate('/activity');
}

export async function createNote(input: CreateNoteInput) {
  const result = createNoteOnDisk(input);

  if (result.success) {
    try {
      rebuildGraphIndex();
    } catch {
      // Graph index is runtime cache; note write already succeeded.
    }
    revalidateNotePaths(result.category, result.slug);
    return { ok: true as const, href: result.href };
  }

  return { ok: false as const, error: result.error } satisfies NoteActionResult;
}

export async function updateNote(input: UpdateNoteInput) {
  const result = updateNoteOnDisk(input);

  if (result.success) {
    try {
      rebuildGraphIndex();
    } catch {
      // Graph index is runtime cache; note write already succeeded.
    }
    revalidateNotePaths(result.category, result.slug);
    return { ok: true as const, href: result.href };
  }

  return { ok: false as const, error: result.error } satisfies NoteActionResult;
}

export async function getCaptureCategories() {
  return categories.map((category) => ({
    key: category.key,
    title: category.title,
    defaultTemplate: category.defaultTemplate,
  }));
}

export async function getStorageModeInfo() {
  return getStorageRuntimeInfo();
}
