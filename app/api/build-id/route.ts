export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/BUILD_ID";
  url.search = "";

  const res = await fetch(url.toString(), {
    headers: { "cache-control": "no-store" }
  });

  const text = await res.text();

  return new Response(text.trim(), {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
