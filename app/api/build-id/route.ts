export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "ok", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      "pragma": "no-cache",
    },
  });
}
