import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exact /queue -> /ideas
  if (pathname === '/queue' || pathname === '/queue/') {
    const url = req.nextUrl.clone();
    url.pathname = '/ideas';
    return NextResponse.redirect(url, 307);
  }

  // Any /queue/* -> /activity
  if (pathname.startsWith('/queue/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/activity';
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/queue/:path*'],
};
