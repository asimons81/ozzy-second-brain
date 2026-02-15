import { getCloudflareContext } from '@opennextjs/cloudflare/cloudflare-context';

export async function getAdminTokenSecret(): Promise<string | null> {
  const processToken = process.env.SECOND_BRAIN_ADMIN_TOKEN?.trim();
  if (processToken) return processToken;

  try {
    const context = await getCloudflareContext({ async: true });
    const cfToken = context.env.SECOND_BRAIN_ADMIN_TOKEN?.trim();
    if (cfToken) return cfToken;
  } catch {
    return null;
  }

  return null;
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

export async function isAuthorizedWriteRequest(req: Request): Promise<boolean> {
  const expected = await getAdminTokenSecret();
  if (!expected) return false;
  const provided = extractBearerToken(req);
  if (!provided) return false;
  return provided === expected;
}
