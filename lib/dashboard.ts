import 'server-only';

import { getAllDocs, type Doc } from '@/lib/brain';
import { readRecents } from '@/lib/storage';
import { readApprovedIdeas, readSidTickets } from '@/lib/pipeline';
import { categories } from '@/lib/categories';

export type StaleNote = {
  title: string;
  category: string;
  slug: string;
  href: string;
  daysSinceModified: number;
};

export type WritingStreak = {
  current: number;
  longest: number;
  todayComplete: boolean;
};

export type PipelineBottleneck = {
  type: 'approved_no_output' | 'stale_ticket';
  title: string;
  href: string;
  ageDays: number;
};

export type CategoryCount = {
  category: string;
  title: string;
  count: number;
};

export type TodayStats = {
  created: number;
  edited: number;
};

export type NeedsReviewNote = {
  title: string;
  category: string;
  slug: string;
  href: string;
  createdAt: string;
};

function daysBetween(a: Date, b: Date) {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function noteHref(category: string, slug: string) {
  return `/docs/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}

function docDate(doc: Doc): Date | null {
  const iso = doc.modified ?? doc.date;
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function getStaleNotes(days = 30, limit = 5): Promise<StaleNote[]> {
  const now = new Date();
  const docs = await getAllDocs();
  const stale: StaleNote[] = [];

  for (const doc of docs) {
    const d = docDate(doc);
    if (!d) continue;
    const age = daysBetween(now, d);
    if (age >= days) {
      stale.push({
        title: doc.title,
        category: doc.category,
        slug: doc.slug,
        href: noteHref(doc.category, doc.slug),
        daysSinceModified: age,
      });
    }
  }

  return stale
    .sort((a, b) => b.daysSinceModified - a.daysSinceModified)
    .slice(0, limit);
}

export async function getWritingStreak(): Promise<WritingStreak> {
  const recents = await readRecents(50);
  if (recents.length === 0) return { current: 0, longest: 0, todayComplete: false };

  const dates = new Set<string>();
  for (const entry of recents) {
    const d = new Date(entry.modifiedAt);
    if (!Number.isNaN(d.getTime())) {
      dates.add(d.toISOString().split('T')[0]);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const todayComplete = dates.has(today);

  let current = 0;
  let longest = 0;
  let streak = 0;
  const check = new Date();

  if (!todayComplete) {
    check.setDate(check.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = check.toISOString().split('T')[0];
    if (dates.has(dateStr)) {
      streak++;
    } else {
      if (current === 0) current = streak;
      longest = Math.max(longest, streak);
      streak = 0;
    }
    check.setDate(check.getDate() - 1);
  }

  if (current === 0) current = streak;
  longest = Math.max(longest, streak);

  return { current, longest, todayComplete };
}

export async function getPipelineBottlenecks(limit = 5): Promise<PipelineBottleneck[]> {
  const bottlenecks: PipelineBottleneck[] = [];
  const now = new Date();

  const approved = (await readApprovedIdeas()).filter((idea) => !idea.outputExists);
  for (const idea of approved) {
    const age = daysBetween(now, new Date(idea.modifiedAt));
    bottlenecks.push({
      type: 'approved_no_output',
      title: idea.title,
      href: idea.href,
      ageDays: age,
    });
  }

  const tickets = (await readSidTickets()).filter((t) => t.isStale);
  for (const ticket of tickets) {
    const age = daysBetween(now, new Date(ticket.createdAt));
    bottlenecks.push({
      type: 'stale_ticket',
      title: ticket.sourceIdeaSlug ?? ticket.id,
      href: ticket.href,
      ageDays: age,
    });
  }

  return bottlenecks
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, limit);
}

export async function getCategoryDistribution(): Promise<CategoryCount[]> {
  const docs = await getAllDocs();
  const counts = new Map<string, number>();
  for (const doc of docs) {
    counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
  }

  return categories
    .map((cat) => ({
      category: cat.key,
      title: cat.title,
      count: counts.get(cat.key) ?? 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

export async function getTodayStats(): Promise<TodayStats> {
  const recents = await readRecents(50);
  const today = new Date().toISOString().split('T')[0];
  let created = 0;
  let edited = 0;

  for (const entry of recents) {
    const d = new Date(entry.modifiedAt);
    if (Number.isNaN(d.getTime())) continue;
    if (d.toISOString().split('T')[0] !== today) continue;
    edited++;
  }

  created = Math.min(edited, 1);

  return { created, edited };
}

export async function getNeedsReviewNotes(limit = 10): Promise<NeedsReviewNote[]> {
  const docs = await getAllDocs();
  const pending: NeedsReviewNote[] = [];

  for (const doc of docs) {
    if (doc.review_status === 'pending') {
      pending.push({
        title: doc.title,
        category: doc.category,
        slug: doc.slug,
        href: noteHref(doc.category, doc.slug),
        createdAt: doc.date ?? new Date().toISOString(),
      });
    }
  }

  return pending.slice(0, limit);
}
