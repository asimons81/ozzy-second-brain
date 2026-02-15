import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare/cloudflare-context';

export type IdeaDecision = 'approved' | 'rejected' | 'needs-work';

export type RecordIdeaDecisionInput = {
  ideaSlug: string;
  decision: IdeaDecision;
  ideaTitle: string;
  reason?: string;
  feedback?: string;
  actor?: string;
};

export type DecisionWriteResult =
  | { ok: true }
  | { ok: false; error: string };

async function getD1Database() {
  try {
    const context = await getCloudflareContext({ async: true });
    return context?.env?.SECOND_BRAIN_DB ?? null;
  } catch {
    return null;
  }
}

function safeValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function randomId() {
  return crypto.randomUUID();
}

export async function recordIdeaDecision(input: RecordIdeaDecisionInput): Promise<DecisionWriteResult> {
  const db = await getD1Database();
  if (!db) {
    return { ok: false, error: 'D1 database is unavailable for decision logging.' };
  }

  const ideaSlug = input.ideaSlug.trim();
  const ideaTitle = input.ideaTitle.trim();

  if (!ideaSlug || !ideaTitle) {
    return { ok: false, error: 'Idea slug and title are required for decision logging.' };
  }

  const decidedAt = new Date().toISOString();
  const id = randomId();

  try {
    await db
      .prepare(
        `INSERT INTO idea_decisions (
          id, idea_slug, decision, reason, feedback, idea_title, decided_at, actor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        ideaSlug,
        input.decision,
        safeValue(input.reason),
        safeValue(input.feedback),
        ideaTitle,
        decidedAt,
        safeValue(input.actor),
      )
      .run();

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to write decision log.';
    return { ok: false, error: message };
  }
}
