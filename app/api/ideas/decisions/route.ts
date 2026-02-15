import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare/cloudflare-context';
import {
  ADMIN_SESSION_COOKIE_NAME,
  extractBearerToken,
  getAdminTokenSecret,
  getAuthenticatedAdmin,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

type IdeaDecision = 'approved' | 'rejected' | 'needs-work' | 'reverted';

type DecisionRow = {
  id: string;
  idea_slug: string;
  idea_title: string;
  decision: IdeaDecision;
  reason: string | null;
  feedback: string | null;
  decided_at: string;
  actor: string | null;
};

function jsonNoStore(payload: unknown, init?: ResponseInit) {
  const response = NextResponse.json(payload, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function hasSessionCookie(req: Request): boolean {
  const raw = req.headers.get('cookie') ?? '';
  return raw
    .split(';')
    .map((part) => part.trim())
    .some((part) => part.startsWith(`${ADMIN_SESSION_COOKIE_NAME}=`));
}

function parseLimit(req: Request): number {
  const raw = new URL(req.url).searchParams.get('limit')?.trim();
  if (!raw) return 50;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 50;
  return Math.min(parsed, 200);
}

async function isAuthorized(req: Request): Promise<{ ok: true } | { ok: false; status: 401 | 403 }> {
  const admin = await getAuthenticatedAdmin(req);
  if (admin) return { ok: true };

  const bearer = extractBearerToken(req);
  const expectedToken = await getAdminTokenSecret();
  if (bearer && expectedToken && bearer === expectedToken) {
    return { ok: true };
  }

  if (hasSessionCookie(req) || Boolean(bearer)) {
    return { ok: false, status: 403 };
  }

  return { ok: false, status: 401 };
}

export async function GET(req: Request) {
  const auth = await isAuthorized(req);
  if (!auth.ok) {
    return jsonNoStore({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status });
  }

  const slug = new URL(req.url).searchParams.get('slug')?.trim();
  const limit = parseLimit(req);

  let db: D1Database | null = null;
  try {
    const context = await getCloudflareContext({ async: true });
    db = context?.env?.SECOND_BRAIN_DB ?? null;
  } catch {
    db = null;
  }

  if (!db) {
    return jsonNoStore({ error: 'D1 database is unavailable.' }, { status: 500 });
  }

  try {
    const sql =
      `SELECT id, idea_slug, idea_title, decision, reason, feedback, decided_at, actor
       FROM idea_decisions` +
      (slug ? ' WHERE idea_slug = ?' : '') +
      ' ORDER BY decided_at DESC LIMIT ?';

    const statement = slug ? db.prepare(sql).bind(slug, limit) : db.prepare(sql).bind(limit);
    const query = await statement.all<DecisionRow>();
    const decisions = query.results ?? [];

    return jsonNoStore({
      count: decisions.length,
      decisions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch idea decision history.';
    return jsonNoStore({ error: message }, { status: 500 });
  }
}
