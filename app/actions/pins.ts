'use server';

import { revalidatePath } from 'next/cache';
import { addPin, removePin, isPinned } from '@/lib/pins';

export async function togglePin(category: string, slug: string, title: string) {
  const pinned = await isPinned(category, slug);

  if (pinned) {
    await removePin(category, slug);
  } else {
    await addPin(category, slug, title);
  }

  revalidatePath('/');
  revalidatePath(`/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`);

  return { pinned: !pinned };
}
