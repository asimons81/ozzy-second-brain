import 'server-only';

import fs from 'fs';
import path from 'path';
import { getStorageAdapter, getStorageRuntimeInfo } from '@/lib/storage';

const SID_QUEUE_DIR = path.join(process.cwd(), 'notes', 'sid-queue');

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

function safeIso(value: unknown) {
  if (typeof value !== 'string') return null;
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return null;
  return value;
}

function fileStem(fileName: string) {
  return fileName.replace(/\.json$/i, '');
}

function ticketKey(raw: Record<string, unknown>, fileName: string) {
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : fileStem(fileName);
  return id;
}

function ticketCreatedAt(raw: Record<string, unknown>, filePath: string) {
  const fromTicket =
    safeIso(raw.created_at) ??
    safeIso(raw.createdAt) ??
    safeIso(raw.updated_at) ??
    safeIso(raw.updatedAt);
  if (fromTicket) return fromTicket;
  return new Date(fs.statSync(filePath).mtimeMs).toISOString();
}

function extractSourceIdeaSlug(raw: Record<string, unknown>) {
  const direct = raw.source_idea;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  const payload = raw.data;
  if (payload && typeof payload === 'object') {
    const sourceIdea = (payload as Record<string, unknown>).source_idea;
    if (typeof sourceIdea === 'string' && sourceIdea.trim()) return sourceIdea.trim();
  }

  return undefined;
}

function extractOutputSlug(raw: Record<string, unknown>, sourceIdea?: string) {
  const candidates: string[] = [];

  if (sourceIdea) {
    candidates.push(`${sourceIdea}-drafts`);
  }

  const directOutput = raw.output_slug;
  if (typeof directOutput === 'string' && directOutput.trim()) {
    candidates.push(directOutput.trim().replace(/\.md$/i, ''));
  }

  const payload = raw.data;
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const outputName = record.output_name;
    if (typeof outputName === 'string' && outputName.trim().endsWith('.md')) {
      candidates.push(outputName.trim().replace(/\.md$/i, ''));
    }

    const outputSlug = record.output_slug;
    if (typeof outputSlug === 'string' && outputSlug.trim()) {
      candidates.push(outputSlug.trim().replace(/\.md$/i, ''));
    }
  }

  const instructions = raw.instructions;
  if (typeof instructions === 'string') {
    const match = instructions.match(/content\/renders\/([a-zA-Z0-9-_]+)\.md/i);
    if (match?.[1]) {
      candidates.push(match[1]);
    }
  }

  return candidates.find(Boolean);
}

function markdownTitle(raw: string, slug: string) {
  const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (titleMatch?.[1]) return titleMatch[1].trim();

  const h1Match = raw.match(/^#\s+(.+)$/m);
  if (h1Match?.[1]) return h1Match[1].trim();

  return slug.replace(/-/g, ' ');
}

export async function readSidTickets(): Promise<SidTicket[]> {
  if (!fs.existsSync(SID_QUEUE_DIR)) return [];

  const storage = await getStorageAdapter();
  const renderSlugs = new Set(await storage.listNotes('renders'));
  const files = fs.readdirSync(SID_QUEUE_DIR).filter((name) => name.endsWith('.json'));

  const tickets = files
    .map((fileName): SidTicket | null => {
      const filePath = path.join(SID_QUEUE_DIR, fileName);

      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
        const createdAt = ticketCreatedAt(raw, filePath);
        const key = ticketKey(raw, fileName);
        const sourceIdeaSlug = extractSourceIdeaSlug(raw);
        const outputSlug = extractOutputSlug(raw, sourceIdeaSlug);
        const outputExists = outputSlug ? renderSlugs.has(outputSlug) : false;
        const derivedStatus: TicketDerivedStatus = outputExists ? 'produced' : 'pending';
        const staleThreshold = Date.now() - 24 * 60 * 60 * 1000;
        const isStale = derivedStatus === 'pending' && new Date(createdAt).getTime() < staleThreshold;

        return {
          key,
          id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : key,
          fileName,
          createdAt,
          status: typeof raw.status === 'string' ? raw.status : 'unknown',
          sourceIdeaSlug,
          outputSlug,
          outputExists,
          derivedStatus,
          isStale,
          href: `/queue/${encodeURIComponent(key)}`,
          outputHref: outputSlug ? `/renders/${encodeURIComponent(outputSlug)}` : undefined,
          raw,
        } satisfies SidTicket;
      } catch {
        return null;
      }
    })
    .filter((ticket): ticket is SidTicket => ticket !== null);

  return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
