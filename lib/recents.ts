import { getStorageAdapter, readRecents as readFromStorage, type RecentsEntry } from '@/lib/storage';

export type RecentEntry = RecentsEntry;

export function readRecents(limit = 50): RecentEntry[] {
  return readFromStorage(limit);
}

export function upsertRecent(entry: RecentEntry) {
  getStorageAdapter().updateRecents(entry);
}
