import { NextResponse } from 'next/server';
import {
  ADMIN_OAUTH_STATE_COOKIE_NAME,
  ADMIN_PKCE_VERIFIER_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSession,
  exchangeGoogleCodeForIdToken,
  isGoogleAdminAllowed,
  verifyGoogleIdToken,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function clearTempCookies(response: NextResponse) {
  response.cookies.set(ADMIN_PKCE_VERIFIER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(ADMIN_OAUTH_STATE_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

function redirectWithError(req: Request, error: string) {
  const response = NextResponse.redirect(new URL(`/docs?auth_error=${encodeURIComponent(error)}`, req.url));
  clearTempCookies(response);
  return response;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code')?.trim();
  const state = url.searchParams.get('state')?.trim();
  const oauthError = url.searchParams.get('error')?.trim();

  if (oauthError) {
    return redirectWithError(req, oauthError);
  }

  if (!code || !state) {
    return redirectWithError(req, 'missing_code_or_state');
  }

  const requestCookies = req.headers.get('cookie') ?? '';
  const cookieMap = new Map(
    requestCookies
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...valueParts] = part.split('=');
        return [key, decodeURIComponent(valueParts.join('='))] as const;
      }),
  );

  const verifier = cookieMap.get(ADMIN_PKCE_VERIFIER_COOKIE_NAME)?.trim();
  const expectedState = cookieMap.get(ADMIN_OAUTH_STATE_COOKIE_NAME)?.trim();

  if (!verifier || !expectedState || expectedState !== state) {
    return redirectWithError(req, 'invalid_state');
  }

  try {
    const idToken = await exchangeGoogleCodeForIdToken(req, code, verifier);
    const { email } = await verifyGoogleIdToken(idToken);
    const allowed = await isGoogleAdminAllowed(email);

    if (!allowed) {
      return redirectWithError(req, 'not_allowed');
    }

    const session = await createAdminSession(email);
    const maxAge = Math.max(1, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));

    const response = NextResponse.redirect(new URL('/docs', req.url));
    clearTempCookies(response);
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, session.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch {
    return redirectWithError(req, 'auth_failed');
  }
}
