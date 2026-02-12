import 'server-only';

export type WikiLink = {
  raw: string;
  target: string;
  label?: string;
  normalizedTarget: string;
};

const WIKI_LINK_RE = /\[\[([^[\]|]+?)(?:\|([^[\]]+?))?\]\]/g;

export function normalizeWikiTarget(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractWikiLinks(markdown: string): WikiLink[] {
  const matches = markdown.matchAll(WIKI_LINK_RE);
  const result: WikiLink[] = [];

  for (const match of matches) {
    const raw = match[0];
    const target = (match[1] ?? '').trim();
    const normalizedTarget = normalizeWikiTarget(target);
    if (!target || !normalizedTarget) continue;

    const rawLabel = (match[2] ?? '').trim();
    result.push({
      raw,
      target,
      label: rawLabel || undefined,
      normalizedTarget,
    });
  }

  return result;
}

export function rewriteWikiLinksToMarkdownLinks(markdown: string) {
  return markdown.replace(WIKI_LINK_RE, (_full, rawTarget: string | undefined, rawLabel: string | undefined) => {
    const target = (rawTarget ?? '').trim();
    if (!target) return _full;

    const normalizedTarget = normalizeWikiTarget(target);
    if (!normalizedTarget) return _full;

    const label = (rawLabel ?? '').trim() || target;
    return `[${label}](/wiki/${encodeURIComponent(normalizedTarget)})`;
  });
}
