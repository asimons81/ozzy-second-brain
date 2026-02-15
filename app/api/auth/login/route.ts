import { NextResponse } from 'next/server';
import {
  ADMIN_OAUTH_STATE_COOKIE_NAME,
  ADMIN_PKCE_VERIFIER_COOKIE_NAME,
  buildGoogleAuthUrl,
  createOAuthState,
  createPkceVerifierAndChallenge,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const TEMP_COOKIE_MAX_AGE_SECONDS = 10 * 60;

function tempCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TEMP_COOKIE_MAX_AGE_SECONDS,
  };
}

export async function GET(req: Request) {
  try {
    const { verifier, challenge } = await createPkceVerifierAndChallenge();
    const state = createOAuthState();
    const googleAuthUrl = await buildGoogleAuthUrl(req, state, challenge);

    const response = NextResponse.redirect(googleAuthUrl);
    response.cookies.set(ADMIN_PKCE_VERIFIER_COOKIE_NAME, verifier, tempCookieOptions());
    response.cookies.set(ADMIN_OAUTH_STATE_COOKIE_NAME, state, tempCookieOptions());
    return response;
  } catch {
    return NextResponse.redirect(new URL('/docs?auth_error=config', req.url));
  }
}
