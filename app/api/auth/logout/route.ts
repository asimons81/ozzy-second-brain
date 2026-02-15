import { NextResponse } from 'next/server';
import {
  ADMIN_OAUTH_STATE_COOKIE_NAME,
  ADMIN_PKCE_VERIFIER_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_NAME,
  deleteAdminSession,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function clearCookie(response: NextResponse, name: string, httpOnly = true) {
  response.cookies.set(name, '', {
    httpOnly,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const sessionCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE_NAME}=`));
  const sessionId = sessionCookie ? decodeURIComponent(sessionCookie.split('=').slice(1).join('=')) : null;

  await deleteAdminSession(sessionId);

  const response = NextResponse.json({ ok: true });
  clearCookie(response, ADMIN_SESSION_COOKIE_NAME);
  clearCookie(response, ADMIN_PKCE_VERIFIER_COOKIE_NAME);
  clearCookie(response, ADMIN_OAUTH_STATE_COOKIE_NAME);
  return response;
}
