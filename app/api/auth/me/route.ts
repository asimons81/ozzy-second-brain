import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const admin = await getAuthenticatedAdmin(req);

  if (!admin) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: admin.email,
  });
}
