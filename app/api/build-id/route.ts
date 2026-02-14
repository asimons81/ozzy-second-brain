export async function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/BUILD_ID";
  url.search = "";

  return new Response(null, {
    status: 307,
    headers: {
      location: url.toString(),
      "cache-control": "no-store, max-age=0",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
