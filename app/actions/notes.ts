'use server';

import { revalidatePath } from 'next/cache';
import { categories } from '@/lib/categories';
import {
  createNoteOnDisk,
  updateNoteOnDisk,
  type CreateNoteInput,
  type UpdateNoteInput,
} from '@/lib/notes';

export type { CreateNoteInput, UpdateNoteInput };

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
}

export async function createNote(input: CreateNoteInput) {
  const result = createNoteOnDisk(input);

  if (result.success) {
    revalidateNotePaths(result.category, result.slug);
    return { success: true as const, href: result.href };
  }

  return result;
}

export async function updateNote(input: UpdateNoteInput) {
  const result = updateNoteOnDisk(input);

  if (result.success) {
    revalidateNotePaths(result.category, result.slug);
    return { success: true as const, href: result.href };
  }

  return result;
}

export async function getCaptureCategories() {
  return categories.map((category) => ({
    key: category.key,
    title: category.title,
    defaultTemplate: category.defaultTemplate,
  }));
}
