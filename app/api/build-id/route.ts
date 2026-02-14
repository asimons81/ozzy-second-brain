export const dynamic = "force-static";

import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const file = readFileSync(join(process.cwd(), "public", "BUILD_ID"), "utf-8").trim();
    return new Response(file, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  } catch {
    return new Response("unknown", { status: 200 });
  }
}
