import 'server-only';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getDoc, getDocsByCategory } from '@/lib/brain';
import { readRecents, getStorageRuntimeInfo } from '@/lib/storage';
import { readSidTickets } from '@/lib/pipeline';

export type ActivityEvent = {
  id: string;
  type: 'note_created' | 'note_updated' | 'ticket_created' | 'render_updated' | 'idea_approved';
  title: string;
  timestampIso: string;
  href: string;
  meta?: Record<string, string>;
};

export type ActivitySnapshot = {
  events: ActivityEvent[];
  lastActivityIso: string | null;
};

function safeIso(value: unknown) {
  if (typeof value !== 'string') return null;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return value;
}

function safeMarkdownTitle(raw: string, slug: string) {
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  if (typeof fm.title === 'string' && fm.title.trim()) {
    return fm.title.trim();
  }
  const h1Match = parsed.content.match(/^#\s+(.+)$/m);
  if (h1Match?.[1]) return h1Match[1].trim();
  return slug.replace(/-/g, ' ');
}

function readApprovedIdeaEvents(): ActivityEvent[] {
  const dataDir = getStorageRuntimeInfo().dataDir;
  const approvedDir = path.join(dataDir, 'approved-ideas');
  if (!fs.existsSync(approvedDir)) return [];

  const files = fs.readdirSync(approvedDir).filter((name) => name.endsWith('.md'));
  const events = files.map((fileName): ActivityEvent | null => {
      const slug = fileName.replace(/\.md$/i, '');
      const filePath = path.join(approvedDir, fileName);

      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const title = safeMarkdownTitle(raw, slug);
        const mtimeIso = new Date(fs.statSync(filePath).mtimeMs).toISOString();

        return {
          id: `approved:${slug}`,
          type: 'idea_approved',
          title: `Idea approved: ${title}`,
          timestampIso: mtimeIso,
          href: `/docs/ideas/${encodeURIComponent(slug)}`,
          meta: { slug },
        } satisfies ActivityEvent;
      } catch {
        return null;
      }
    });

  return events.filter((event): event is ActivityEvent => event !== null);
}

function recentsEvents(): ActivityEvent[] {
  return readRecents(100).map((entry) => {
    const doc = getDoc(entry.category, entry.slug);
    const created = safeIso(doc?.date);
    const modified = safeIso(doc?.modified) ?? entry.modifiedAt;
    const eventType =
      created && modified && new Date(modified).getTime() - new Date(created).getTime() < 1_000
        ? 'note_created'
        : 'note_updated';

    return {
      id: `recent:${entry.key}:${modified}`,
      type: eventType,
      title: entry.title,
      timestampIso: modified,
      href: entry.path,
      meta: {
        category: entry.category,
        slug: entry.slug,
      },
    } satisfies ActivityEvent;
  });
}

function ticketEvents(): ActivityEvent[] {
  return readSidTickets().map((ticket) => ({
    id: `ticket:${ticket.key}:${ticket.createdAt}`,
    type: 'ticket_created',
    title: `Sid ticket: ${ticket.sourceIdeaSlug ?? ticket.id}`,
    timestampIso: ticket.createdAt,
    href: ticket.href,
    meta: {
      status: ticket.derivedStatus,
      id: ticket.id,
    },
  }));
}

function renderEvents(): ActivityEvent[] {
  return getDocsByCategory('renders').map((render) => {
    const timestampIso = safeIso(render.modified) ?? safeIso(render.date) ?? new Date(0).toISOString();
    return {
      id: `render:${render.slug}:${timestampIso}`,
      type: 'render_updated',
      title: render.title,
      timestampIso,
      href: `/renders/${encodeURIComponent(render.slug)}`,
      meta: {
        slug: render.slug,
      },
    } satisfies ActivityEvent;
  });
}

export function getActivityEvents(limit = 200): ActivityEvent[] {
  const events = [
    ...recentsEvents(),
    ...ticketEvents(),
    ...renderEvents(),
    ...readApprovedIdeaEvents(),
  ].sort((a, b) => new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime());

  return events.slice(0, limit);
}

export function getActivitySnapshot(limit = 200): ActivitySnapshot {
  const events = getActivityEvents(limit);
  return {
    events,
    lastActivityIso: events[0]?.timestampIso ?? null,
  };
}
