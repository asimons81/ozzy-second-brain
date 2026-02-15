import { NextResponse } from "next/server";
import { getStorageRuntimeInfo } from "@/lib/storage";
import { getCloudflareContext } from "@opennextjs/cloudflare/cloudflare-context";

export const dynamic = "force-dynamic";

export async function GET() {
  let hasD1 = false;
  let hasAssets = false;

  try {
    const ctx = await getCloudflareContext({ async: true });
    hasD1 = Boolean(ctx?.env?.SECOND_BRAIN_DB);
    hasAssets = Boolean(ctx?.env?.ASSETS);
  } catch {}

  const info = await getStorageRuntimeInfo();

  return NextResponse.json({
    env: {
      CF_WORKER: process.env.CF_WORKER,
      CF_PAGES: process.env.CF_PAGES,
    },
    bindings: { hasD1, hasAssets },
    storage: info,
  });
}
