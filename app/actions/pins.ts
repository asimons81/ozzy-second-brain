'use server';

import { revalidatePath } from 'next/cache';
import { addPin, removePin, isPinned } from '@/lib/pins';

export async function togglePin(category: string, slug: string, title: string) {
  const pinned = isPinned(category, slug);

  if (pinned) {
    removePin(category, slug);
  } else {
    addPin(category, slug, title);
  }

  revalidatePath('/');
  revalidatePath(`/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`);

  return { pinned: !pinned };
}
