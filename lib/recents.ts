import { getStorageAdapter, readRecents as readFromStorage, type RecentsEntry } from '@/lib/storage';

export type RecentEntry = RecentsEntry;

export async function readRecents(limit = 50): Promise<RecentEntry[]> {
  return readFromStorage(limit);
}

export async function upsertRecent(entry: RecentEntry) {
  const adapter = await getStorageAdapter();
  await adapter.updateRecents(entry);
}
