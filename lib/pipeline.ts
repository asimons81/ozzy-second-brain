import 'server-only';

import { getStorageAdapter } from '@/lib/storage';

export type TicketDerivedStatus = 'pending' | 'produced';

export type SidTicket = {
  key: string;
  id: string;
  fileName: string;
  createdAt: string;
  status: string;
  sourceIdeaSlug?: string;
  outputSlug?: string;
  outputExists: boolean;
  derivedStatus: TicketDerivedStatus;
  isStale: boolean;
  href: string;
  outputHref?: string;
  raw: Record<string, unknown>;
};

export type ApprovedIdea = {
  slug: string;
  title: string;
  modifiedAt: string;
  href: string;
  outputSlug: string;
  outputExists: boolean;
  outputHref: string;
};

function markdownTitle(raw: string, slug: string) {
  const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (titleMatch?.[1]) return titleMatch[1].trim();

  const h1Match = raw.match(/^#\s+(.+)$/m);
  if (h1Match?.[1]) return h1Match[1].trim();

  return slug.replace(/-/g, ' ');
}

export async function readSidTickets(): Promise<SidTicket[]> {
  return [];
}

export async function getSidTicketByKey(ticketKeyValue: string) {
  return (await readSidTickets()).find((ticket) => ticket.key === ticketKeyValue || ticket.id === ticketKeyValue) ?? null;
}

export async function readApprovedIdeas(): Promise<ApprovedIdea[]> {
  const storage = await getStorageAdapter();
  const renderSlugs = new Set(await storage.listNotes('renders'));
  const slugs = await storage.listNotes('approved-ideas');

  const ideas = await Promise.all(
    slugs.map(async (slug) => {
      const outputSlug = `${slug}-drafts`;
      const outputExists = renderSlugs.has(outputSlug);

      try {
        const note: any = await storage.readNote('approved-ideas', slug);
        const raw = typeof note === 'string' ? note : note?.content ?? '';
        const modifiedAt =
          note?.modified ??
          note?.updatedAt ??
          note?.updated_at ??
          new Date().toISOString();

        return {
          slug,
          title: markdownTitle(raw, slug),
          modifiedAt,
          href: `/docs/approved-ideas/${encodeURIComponent(slug)}`,
          outputSlug,
          outputExists,
          outputHref: `/renders/${encodeURIComponent(outputSlug)}`,
        } satisfies ApprovedIdea;
      } catch {
        return null;
      }
    })
  );

  const filtered = ideas.filter((item): item is ApprovedIdea => item !== null);
  return filtered.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
}
