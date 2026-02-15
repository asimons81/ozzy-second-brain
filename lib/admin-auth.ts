import { getCloudflareContext } from '@opennextjs/cloudflare/cloudflare-context';

export const ADMIN_SESSION_COOKIE_NAME = 'ozzy_admin_session';
export const ADMIN_PKCE_VERIFIER_COOKIE_NAME = 'ozzy_admin_pkce_verifier';
export const ADMIN_OAUTH_STATE_COOKIE_NAME = 'ozzy_admin_oauth_state';

const DEFAULT_SESSION_TTL_HOURS = 12;

type CloudflareContextEnv = {
  SECOND_BRAIN_DB?: D1Database;
  SECOND_BRAIN_ADMIN_TOKEN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ADMIN_GOOGLE_ALLOWLIST?: string;
  SESSION_TTL_HOURS?: string;
};
type CloudflareStringEnvKey = Exclude<keyof CloudflareContextEnv, 'SECOND_BRAIN_DB'>;

type SessionRow = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
};

type GoogleTokenInfo = {
  aud: string;
  iss: string;
  exp: string;
  email?: string;
  email_verified?: 'true' | 'false';
};

export type AuthenticatedAdmin = {
  authenticated: true;
  email: string;
  sessionId: string;
};

async function getCloudflareEnv(): Promise<CloudflareContextEnv | null> {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env as CloudflareContextEnv;
  } catch {
    return null;
  }
}

async function getEnvValue(name: CloudflareStringEnvKey): Promise<string | null> {
  const processValue = process.env[name]?.trim();
  if (processValue) return processValue;

  const cfEnv = await getCloudflareEnv();
  const cfValue = cfEnv?.[name]?.trim();
  return cfValue || null;
}

function parseCookies(req: Request): Map<string, string> {
  const raw = req.headers.get('cookie') ?? '';
  const map = new Map<string, string>();

  for (const part of raw.split(';')) {
    const [name, ...valueParts] = part.trim().split('=');
    if (!name || valueParts.length === 0) continue;
    map.set(name, decodeURIComponent(valueParts.join('=')));
  }

  return map;
}

async function getD1Database(): Promise<D1Database | null> {
  const cfEnv = await getCloudflareEnv();
  return cfEnv?.SECOND_BRAIN_DB ?? null;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function randomBase64Url(bytesLength: number): string {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function createPkceVerifierAndChallenge() {
  const verifier = randomBase64Url(64);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(digest));
  return { verifier, challenge };
}

export function createOAuthState(): string {
  return randomBase64Url(32);
}

async function getGoogleOAuthConfig() {
  const clientId = await getEnvValue('GOOGLE_CLIENT_ID');
  const clientSecret = await getEnvValue('GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth env is not configured.');
  }

  return { clientId, clientSecret };
}

function getGoogleRedirectUri(req: Request) {
  return new URL('/api/auth/callback', req.url).toString();
}

export async function buildGoogleAuthUrl(req: Request, state: string, codeChallenge: string): Promise<string> {
  const { clientId } = await getGoogleOAuthConfig();
  const redirectUri = getGoogleRedirectUri(req);

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');

  return url.toString();
}

export async function exchangeGoogleCodeForIdToken(req: Request, code: string, codeVerifier: string): Promise<string> {
  const { clientId, clientSecret } = await getGoogleOAuthConfig();
  const redirectUri = getGoogleRedirectUri(req);

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = (await response.json().catch(() => null)) as { id_token?: string; error?: string } | null;

  if (!response.ok || !payload?.id_token) {
    throw new Error(payload?.error || 'Unable to exchange Google OAuth code.');
  }

  return payload.id_token;
}

export async function verifyGoogleIdToken(idToken: string): Promise<{ email: string }> {
  const { clientId } = await getGoogleOAuthConfig();

  const tokenInfoUrl = new URL('https://oauth2.googleapis.com/tokeninfo');
  tokenInfoUrl.searchParams.set('id_token', idToken);

  const response = await fetch(tokenInfoUrl, { method: 'GET' });
  const info = (await response.json().catch(() => null)) as GoogleTokenInfo | null;

  if (!response.ok || !info) {
    throw new Error('Unable to verify Google ID token.');
  }

  if (info.aud !== clientId) {
    throw new Error('Google ID token audience mismatch.');
  }

  if (info.iss !== 'https://accounts.google.com' && info.iss !== 'accounts.google.com') {
    throw new Error('Google ID token issuer mismatch.');
  }

  const exp = Number.parseInt(info.exp, 10);
  if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) {
    throw new Error('Google ID token expired.');
  }

  const email = info.email?.trim().toLowerCase();
  if (!email) {
    throw new Error('Google account email missing.');
  }

  if (info.email_verified !== 'true') {
    throw new Error('Google account email is not verified.');
  }

  return { email };
}

function parseAllowlist(raw: string | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isGoogleAdminAllowed(email: string): Promise<boolean> {
  const allowlist = parseAllowlist(await getEnvValue('ADMIN_GOOGLE_ALLOWLIST'));
  if (allowlist.size === 0) return false;
  return allowlist.has(email.trim().toLowerCase());
}

function resolveSessionTtlHours(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SESSION_TTL_HOURS;
  return parsed;
}

export async function createAdminSession(email: string): Promise<{ id: string; expiresAt: string }> {
  const db = await getD1Database();
  if (!db) {
    throw new Error('D1 database is required for admin sessions.');
  }

  const now = new Date();
  const ttlHours = resolveSessionTtlHours(await getEnvValue('SESSION_TTL_HOURS'));
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000).toISOString();
  const id = randomBase64Url(32);

  await db
    .prepare('INSERT INTO admin_sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(id, email, now.toISOString(), expiresAt)
    .run();

  return { id, expiresAt };
}

export async function deleteAdminSession(sessionId: string | null): Promise<void> {
  const normalized = sessionId?.trim();
  if (!normalized) return;

  const db = await getD1Database();
  if (!db) return;

  await db.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(normalized).run();
}

async function readAdminSession(sessionId: string): Promise<SessionRow | null> {
  const db = await getD1Database();
  if (!db) return null;

  return db
    .prepare('SELECT id, email, created_at, expires_at FROM admin_sessions WHERE id = ? LIMIT 1')
    .bind(sessionId)
    .first<SessionRow>();
}

export async function getAuthenticatedAdmin(req: Request): Promise<AuthenticatedAdmin | null> {
  const sessionId = parseCookies(req).get(ADMIN_SESSION_COOKIE_NAME)?.trim();
  if (!sessionId) return null;

  const row = await readAdminSession(sessionId);
  if (!row) return null;

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await deleteAdminSession(sessionId);
    return null;
  }

  return {
    authenticated: true,
    email: row.email,
    sessionId: row.id,
  };
}

export async function getAdminTokenSecret(): Promise<string | null> {
  return getEnvValue('SECOND_BRAIN_ADMIN_TOKEN');
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

export async function isAuthorizedWriteRequest(req: Request): Promise<boolean> {
  const authenticatedAdmin = await getAuthenticatedAdmin(req);
  if (authenticatedAdmin) {
    return true;
  }

  // TODO: remove legacy bearer-token auth once all clients use Google OAuth sessions.
  const expected = await getAdminTokenSecret();
  if (!expected) return false;
  const provided = extractBearerToken(req);
  if (!provided) return false;
  return provided === expected;
}
