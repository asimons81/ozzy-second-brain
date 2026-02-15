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

async function pinsPath() {
  const { dataDir } = await getStorageRuntimeInfo();
  if (!dataDir.startsWith('/')) {
    return path.join(process.cwd(), '.data', 'pins.json');
  }
  return path.join(dataDir, '.index', 'pins.json');
}

export async function readPins(): Promise<PinnedNote[]> {
  const filePath = await pinsPath();
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

async function writePins(pins: PinnedNote[]) {
  const filePath = await pinsPath();
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(pins, null, 2), 'utf-8');
}

export async function addPin(category: string, slug: string, title: string) {
  const pins = await readPins();
  const exists = pins.some((p) => p.category === category && p.slug === slug);
  if (exists) return;

  pins.unshift({
    category,
    slug,
    title,
    pinnedAt: new Date().toISOString(),
    href: `/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
  });

  await writePins(pins);
}

export async function removePin(category: string, slug: string) {
  const pins = await readPins();
  const filtered = pins.filter((p) => !(p.category === category && p.slug === slug));
  await writePins(filtered);
}

export async function isPinned(category: string, slug: string): Promise<boolean> {
  return (await readPins()).some((p) => p.category === category && p.slug === slug);
}
