'use server';

import { revalidatePath } from 'next/cache';
import matter from 'gray-matter';
import { getStorageAdapter } from '@/lib/storage';
import { recordIdeaDecision } from '@/lib/decisions';

const PARTIAL_SUCCESS_ERROR = 'Decision logging failed after note update/move/delete.';

type ActionResult = { success: true } | { success: false; error: string };

function safeRevalidate(pathname: string) {
  try {
    revalidatePath(pathname);
  } catch {
    // Revalidation context is only present during Next request execution.
  }
}

function revalidateIdeaPaths(slug: string) {
  safeRevalidate('/');
  safeRevalidate('/ideas');
  safeRevalidate('/docs/ideas');
  safeRevalidate('/docs/approved-ideas');
  safeRevalidate(`/docs/ideas/${encodeURIComponent(slug)}`);
  safeRevalidate(`/docs/approved-ideas/${encodeURIComponent(slug)}`);
  safeRevalidate('/activity');
}

function normalizeTags(raw: unknown) {
  const source = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : [];
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of source) {
    if (typeof item !== 'string') continue;
    const normalized = item.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    tags.push(normalized);
  }

  return tags;
}

function withNeedsWorkTags(raw: unknown) {
  const tags = normalizeTags(raw).filter((tag) => tag !== 'approved');
  if (!tags.includes('needs-work')) {
    tags.push('needs-work');
  }
  return tags;
}

function withoutApprovedTag(raw: unknown) {
  return normalizeTags(raw).filter((tag) => tag !== 'approved');
}

function titleFromMarkdown(markdown: string, fallbackSlug: string) {
  const parsed = matter(markdown);
  const data = parsed.data as Record<string, unknown>;
  if (typeof data.title === 'string' && data.title.trim()) {
    return data.title.trim();
  }
  const h1 = parsed.content.match(/^#\s+(.+)$/m);
  if (h1?.[1]) return h1[1].trim();
  return fallbackSlug.replace(/-/g, ' ');
}

function normalizeSlug(slug: string) {
  const normalized = slug.trim();
  if (!normalized || normalized.includes('/') || normalized.includes('\\') || normalized.includes('..')) {
    return null;
  }
  return normalized;
}

function decisionLoggingFailed() {
  return { success: false as const, error: PARTIAL_SUCCESS_ERROR };
}

export async function approveIdea(slug: string): Promise<ActionResult> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return { success: false, error: 'Invalid slug' };

  try {
    const storage = await getStorageAdapter();
    const markdown = await storage.readNote('ideas', normalizedSlug);
    const ideaTitle = titleFromMarkdown(markdown, normalizedSlug);

    // Required ordering: move first, log decision second.
    await storage.writeNote('approved-ideas', normalizedSlug, markdown);
    await storage.deleteNote('ideas', normalizedSlug);

    const decision = await recordIdeaDecision({
      ideaSlug: normalizedSlug,
      decision: 'approved',
      ideaTitle,
    });
    if (!decision.ok) return decisionLoggingFailed();

    revalidateIdeaPaths(normalizedSlug);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to approve idea.';
    return { success: false, error: message };
  }
}

export async function rejectIdea(slug: string, reason: string): Promise<ActionResult> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return { success: false, error: 'Invalid slug' };
  const trimmedReason = reason.trim();
  if (!trimmedReason) return { success: false, error: 'Reason is required.' };

  try {
    const storage = await getStorageAdapter();
    const markdown = await storage.readNote('ideas', normalizedSlug);
    const ideaTitle = titleFromMarkdown(markdown, normalizedSlug);

    // Required ordering: delete first, log decision second.
    await storage.deleteNote('ideas', normalizedSlug);

    const decision = await recordIdeaDecision({
      ideaSlug: normalizedSlug,
      decision: 'rejected',
      ideaTitle,
      reason: trimmedReason,
    });
    if (!decision.ok) return decisionLoggingFailed();

    revalidateIdeaPaths(normalizedSlug);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reject idea.';
    return { success: false, error: message };
  }
}

export async function needsWorkIdea(slug: string, feedback: string): Promise<ActionResult> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return { success: false, error: 'Invalid slug' };
  const trimmedFeedback = feedback.trim();
  if (!trimmedFeedback) return { success: false, error: 'Feedback is required.' };

  try {
    const storage = await getStorageAdapter();
    const markdown = await storage.readNote('ideas', normalizedSlug);
    const parsed = matter(markdown);
    const data = parsed.data as Record<string, unknown>;
    const ideaTitle = titleFromMarkdown(markdown, normalizedSlug);

    const nextData: Record<string, unknown> = {
      ...data,
      tags: withNeedsWorkTags(data.tags),
      needs_work_feedback: trimmedFeedback,
      needs_work_at: new Date().toISOString(),
    };
    const updatedMarkdown = matter.stringify(parsed.content, nextData);

    // Required ordering: rewrite first, log decision second.
    await storage.writeNote('ideas', normalizedSlug, updatedMarkdown);

    const decision = await recordIdeaDecision({
      ideaSlug: normalizedSlug,
      decision: 'needs-work',
      ideaTitle,
      feedback: trimmedFeedback,
    });
    if (!decision.ok) return decisionLoggingFailed();

    revalidateIdeaPaths(normalizedSlug);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update idea.';
    return { success: false, error: message };
  }
}

export async function revertApprovedIdea(slug: string): Promise<ActionResult> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return { success: false, error: 'Invalid slug' };

  try {
    const storage = await getStorageAdapter();
    const markdown = await storage.readNote('approved-ideas', normalizedSlug);
    const parsed = matter(markdown);
    const data = parsed.data as Record<string, unknown>;
    const ideaTitle = titleFromMarkdown(markdown, normalizedSlug);

    const nextData: Record<string, unknown> = {
      ...data,
      tags: withoutApprovedTag(data.tags),
    };
    const updatedMarkdown = matter.stringify(parsed.content, nextData);

    // Required ordering: move first, log decision second.
    await storage.writeNote('ideas', normalizedSlug, updatedMarkdown);
    await storage.deleteNote('approved-ideas', normalizedSlug);

    const decision = await recordIdeaDecision({
      ideaSlug: normalizedSlug,
      decision: 'reverted',
      ideaTitle,
      reason: 'Undo approve',
    });
    if (!decision.ok) return decisionLoggingFailed();

    revalidateIdeaPaths(normalizedSlug);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to revert approved idea.';
    return { success: false, error: message };
  }
}

export async function rejectApprovedIdea(slug: string, reason: string): Promise<ActionResult> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return { success: false, error: 'Invalid slug' };
  const trimmedReason = reason.trim();
  if (!trimmedReason) return { success: false, error: 'Reason is required.' };

  try {
    const storage = await getStorageAdapter();
    const markdown = await storage.readNote('approved-ideas', normalizedSlug);
    const ideaTitle = titleFromMarkdown(markdown, normalizedSlug);

    // Required ordering: delete first, log decision second.
    await storage.deleteNote('approved-ideas', normalizedSlug);

    const decision = await recordIdeaDecision({
      ideaSlug: normalizedSlug,
      decision: 'rejected',
      ideaTitle,
      reason: trimmedReason,
    });
    if (!decision.ok) return decisionLoggingFailed();

    revalidateIdeaPaths(normalizedSlug);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reject approved idea.';
    return { success: false, error: message };
  }
}

export async function deleteIdea(slug: string): Promise<ActionResult> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return { success: false, error: 'Invalid slug' };

  try {
    const storage = await getStorageAdapter();
    await storage.deleteNote('ideas', normalizedSlug);
    revalidateIdeaPaths(normalizedSlug);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete idea.';
    return { success: false, error: message };
  }
}
