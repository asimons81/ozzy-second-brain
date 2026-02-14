import 'server-only';

import fs from 'fs';
import path from 'path';
import type { Doc } from '@/lib/brain';
import { getAllDocs } from '@/lib/brain';
import { getStorageRuntimeInfo } from '@/lib/storage';
import { extractWikiLinks, normalizeWikiTarget } from '@/lib/wiki-links';

export type CanonicalDocId = string;

export type GraphNode = {
  category: string;
  slug: string;
  title: string;
  tags: string[];
};

export type GraphIndex = {
  nodes: Record<CanonicalDocId, GraphNode>;
  outbound: Record<CanonicalDocId, CanonicalDocId[]>;
  inbound: Record<CanonicalDocId, CanonicalDocId[]>;
};

export type GraphDocPreview = {
  id: CanonicalDocId;
  category: string;
  slug: string;
  title: string;
  tags: string[];
  modified?: string;
  date?: string;
};

export type GraphDocPanel = {
  inbound: GraphDocPreview[];
  outbound: GraphDocPreview[];
  relatedByTag: GraphDocPreview[];
};

type DocResolver = {
  bySlug: Map<string, Doc[]>;
  byTitle: Map<string, Doc[]>;
};

function graphFilePath() {
  const baseDir = getStorageRuntimeInfo().dataDir;
  return path.join(baseDir, '.index', 'graph.json');
}

function emptyGraph(): GraphIndex {
  return {
    nodes: {},
    outbound: {},
    inbound: {},
  };
}

function docTimestamp(doc: Doc) {
  const modifiedTs = doc.modified ? new Date(doc.modified).getTime() : 0;
  if (modifiedTs > 0) return modifiedTs;
  const dateTs = doc.date ? new Date(doc.date).getTime() : 0;
  if (dateTs > 0) return dateTs;
  return 0;
}

export function toCanonicalDocId(category: string, slug: string) {
  return `${category}:${slug}`;
}

function compareDocs(a: Doc, b: Doc) {
  const tsDiff = docTimestamp(b) - docTimestamp(a);
  if (tsDiff !== 0) return tsDiff;
  return toCanonicalDocId(a.category, a.slug).localeCompare(toCanonicalDocId(b.category, b.slug));
}

function buildResolver(docs: Doc[]): DocResolver {
  const bySlug = new Map<string, Doc[]>();
  const byTitle = new Map<string, Doc[]>();

  for (const doc of docs) {
    const normalizedSlug = normalizeWikiTarget(doc.slug);
    const normalizedTitle = normalizeWikiTarget(doc.title);

    if (normalizedSlug) {
      const list = bySlug.get(normalizedSlug) ?? [];
      list.push(doc);
      bySlug.set(normalizedSlug, list);
    }
    if (normalizedTitle) {
      const list = byTitle.get(normalizedTitle) ?? [];
      list.push(doc);
      byTitle.set(normalizedTitle, list);
    }
  }

  for (const [key, list] of bySlug.entries()) {
    bySlug.set(key, [...list].sort(compareDocs));
  }
  for (const [key, list] of byTitle.entries()) {
    byTitle.set(key, [...list].sort(compareDocs));
  }

  return { bySlug, byTitle };
}

function resolveWikiTargetToDoc(target: string, resolver: DocResolver) {
  const normalized = normalizeWikiTarget(target);
  if (!normalized) return null;

  const slugMatches = resolver.bySlug.get(normalized);
  if (slugMatches?.length) return slugMatches[0];

  const titleMatches = resolver.byTitle.get(normalized);
  if (titleMatches?.length) return titleMatches[0];

  return null;
}

function isGraphNode(value: unknown): value is GraphNode {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GraphNode>;
  return (
    typeof candidate.category === 'string' &&
    typeof candidate.slug === 'string' &&
    typeof candidate.title === 'string' &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === 'string')
  );
}

function readGraphUnsafe() {
  const filePath = graphFilePath();
  if (!fs.existsSync(filePath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Partial<GraphIndex>;
    if (!parsed || typeof parsed !== 'object') return null;

    const nodes = parsed.nodes ?? {};
    const outbound = parsed.outbound ?? {};
    const inbound = parsed.inbound ?? {};

    if (typeof nodes !== 'object' || typeof outbound !== 'object' || typeof inbound !== 'object') {
      return null;
    }

    const safe: GraphIndex = emptyGraph();

    for (const [id, node] of Object.entries(nodes)) {
      if (isGraphNode(node)) {
        safe.nodes[id] = {
          category: node.category,
          slug: node.slug,
          title: node.title,
          tags: [...new Set(node.tags)],
        };
      }
    }

    for (const [id, links] of Object.entries(outbound)) {
      if (Array.isArray(links)) {
        safe.outbound[id] = [...new Set(links.filter((item): item is string => typeof item === 'string'))];
      }
    }

    for (const [id, links] of Object.entries(inbound)) {
      if (Array.isArray(links)) {
        safe.inbound[id] = [...new Set(links.filter((item): item is string => typeof item === 'string'))];
      }
    }

    return safe;
  } catch {
    return null;
  }
}

function writeGraphIndex(graph: GraphIndex) {
  const filePath = graphFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(graph, null, 2), 'utf-8');
}

export function readGraphIndex() {
  return readGraphUnsafe() ?? emptyGraph();
}

export function rebuildGraphIndex() {
  const docs = getAllDocs();
  const resolver = buildResolver(docs);
  const graph = emptyGraph();

  for (const doc of docs) {
    const id = toCanonicalDocId(doc.category, doc.slug);
    graph.nodes[id] = {
      category: doc.category,
      slug: doc.slug,
      title: doc.title,
      tags: doc.tags ?? [],
    };
    graph.outbound[id] = [];
    graph.inbound[id] = [];
  }

  for (const doc of docs) {
    const sourceId = toCanonicalDocId(doc.category, doc.slug);
    const outbound = new Set<string>();
    for (const link of extractWikiLinks(doc.content)) {
      const target = resolveWikiTargetToDoc(link.target, resolver);
      if (!target) continue;

      const targetId = toCanonicalDocId(target.category, target.slug);
      if (targetId === sourceId) continue;
      outbound.add(targetId);
    }

    graph.outbound[sourceId] = [...outbound].sort();
  }

  for (const [sourceId, links] of Object.entries(graph.outbound)) {
    for (const targetId of links) {
      const existing = new Set(graph.inbound[targetId] ?? []);
      existing.add(sourceId);
      graph.inbound[targetId] = [...existing].sort();
    }
  }

  writeGraphIndex(graph);
  return graph;
}

export function getGraphIndex(options?: { rebuildIfMissing?: boolean }) {
  const rebuildIfMissing = options?.rebuildIfMissing ?? true;
  const existing = readGraphUnsafe();
  if (existing) return existing;
  if (!rebuildIfMissing) return emptyGraph();
  return rebuildGraphIndex();
}

function toPreview(doc: Doc): GraphDocPreview {
  return {
    id: toCanonicalDocId(doc.category, doc.slug),
    category: doc.category,
    slug: doc.slug,
    title: doc.title,
    tags: doc.tags ?? [],
    modified: doc.modified,
    date: doc.date,
  };
}

function docsById() {
  const docs = getAllDocs();
  const byId = new Map<string, Doc>();
  for (const doc of docs) {
    byId.set(toCanonicalDocId(doc.category, doc.slug), doc);
  }
  return { docs, byId };
}

export function resolveWikiSlugToDoc(slug: string) {
  const docs = getAllDocs();
  const resolver = buildResolver(docs);
  return resolveWikiTargetToDoc(slug, resolver);
}

export function getWikiStaticSlugs() {
  const docs = getAllDocs();
  const slugs = new Set<string>();

  for (const doc of docs) {
    const normalizedSlug = normalizeWikiTarget(doc.slug);
    if (normalizedSlug) slugs.add(normalizedSlug);

    const normalizedTitle = normalizeWikiTarget(doc.title);
    if (normalizedTitle) slugs.add(normalizedTitle);
  }

  return [...slugs].sort((a, b) => a.localeCompare(b));
}

export function getDocPanelData(category: string, slug: string): GraphDocPanel {
  const id = toCanonicalDocId(category, slug);
  const graph = getGraphIndex({ rebuildIfMissing: true });
  const { docs, byId } = docsById();
  const current = byId.get(id);

  if (!current) {
    return {
      inbound: [],
      outbound: [],
      relatedByTag: [],
    };
  }

  const inbound = (graph.inbound[id] ?? [])
    .map((docId) => byId.get(docId))
    .filter((doc): doc is Doc => Boolean(doc))
    .sort(compareDocs)
    .map(toPreview);

  const outbound = (graph.outbound[id] ?? [])
    .map((docId) => byId.get(docId))
    .filter((doc): doc is Doc => Boolean(doc))
    .sort(compareDocs)
    .map(toPreview);

  const currentTags = new Set(current.tags ?? []);
  const outboundIds = new Set(outbound.map((item) => item.id));
  const inboundIds = new Set(inbound.map((item) => item.id));

  const relatedByTag = docs
    .filter((doc) => toCanonicalDocId(doc.category, doc.slug) !== id)
    .map((doc) => {
      const tags = doc.tags ?? [];
      const overlap = tags.filter((tag) => currentTags.has(tag)).length;
      return { doc, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || compareDocs(a.doc, b.doc))
    .map((item) => toPreview(item.doc))
    .filter((item) => !inboundIds.has(item.id) && !outboundIds.has(item.id))
    .slice(0, 6);

  return {
    inbound,
    outbound,
    relatedByTag,
  };
}
