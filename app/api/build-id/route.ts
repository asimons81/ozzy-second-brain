export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/BUILD_ID";
  url.search = "";

  // Return the BUILD_ID asset (served by the worker/assets)
  const res = await fetch(url.toString(), {
    headers: { "cache-control": "no-store" },
  });

  return new Response(await res.text(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no

-store, max-age=0",
    },
  });
}
