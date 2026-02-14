import 'server-only';

import fs from 'fs';
import path from 'path';
import { getStorageRuntimeInfo } from '@/lib/storage';

export type PinnedNote = {
  category: string;
  slug: string;
  title: string;
  pinnedAt: string;
  href: string;
};

function pinsPath() {
  const { dataDir } = getStorageRuntimeInfo();
  return path.join(dataDir, '.index', 'pins.json');
}

export function readPins(): PinnedNote[] {
  const filePath = pinsPath();
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PinnedNote =>
        item &&
        typeof item === 'object' &&
        typeof item.category === 'string' &&
        typeof item.slug === 'string' &&
        typeof item.title === 'string' &&
        typeof item.pinnedAt === 'string' &&
        typeof item.href === 'string',
    );
  } catch {
    return [];
  }
}

function writePins(pins: PinnedNote[]) {
  const filePath = pinsPath();
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(pins, null, 2), 'utf-8');
}

export function addPin(category: string, slug: string, title: string) {
  const pins = readPins();
  const exists = pins.some((p) => p.category === category && p.slug === slug);
  if (exists) return;

  pins.unshift({
    category,
    slug,
    title,
    pinnedAt: new Date().toISOString(),
    href: `/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
  });

  writePins(pins);
}

export function removePin(category: string, slug: string) {
  const pins = readPins();
  const filtered = pins.filter((p) => !(p.category === category && p.slug === slug));
  writePins(filtered);
}

export function isPinned(category: string, slug: string): boolean {
  return readPins().some((p) => p.category === category && p.slug === slug);
}
