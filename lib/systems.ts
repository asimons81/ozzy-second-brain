import 'server-only';

import fs from 'fs';
import path from 'path';

export type SystemLink = {
  label: string;
  href: string;
};

type SystemsConfig = {
  systems?: SystemLink[];
};

const CONFIG_PATH = path.join(process.cwd(), 'trt-systems.json');

const fallbackSystems: SystemLink[] = [
  { label: 'Brain', href: 'https://brain.tonyreviewsthings.com' },
  { label: 'Quota', href: 'https://status.tonyreviewsthings.com' },
  { label: 'Captions', href: 'https://captions.tonyreviewsthings.com' },
  { label: 'Analytics', href: 'https://post.tonyreviewsthings.com' },
];

function isValidSystemLink(value: unknown): value is SystemLink {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SystemLink>;
  return (
    typeof candidate.label === 'string' &&
    candidate.label.trim().length > 0 &&
    typeof candidate.href === 'string' &&
    candidate.href.trim().length > 0
  );
}

export function getSystemLinks(): SystemLink[] {
  if (!fs.existsSync(CONFIG_PATH)) return fallbackSystems;

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as SystemsConfig;
    if (!Array.isArray(parsed.systems)) return fallbackSystems;

    const valid = parsed.systems.filter(isValidSystemLink);
    return valid.length > 0 ? valid : fallbackSystems;
  } catch {
    return fallbackSystems;
  }
}

