# OZZY Second Brain

Next.js App Router app deployed to Cloudflare Workers via OpenNext.

## Persistent Storage Model

- Local dev: reads/writes markdown files in `content/`
- Cloudflare Workers:
  - If `SECOND_BRAIN_DB` D1 binding exists: reads/writes notes in D1 (durable)
  - If D1 binding is missing: falls back to bundled `public/content` in read-only mode
- In D1 mode, bundled `public/content` is used once as a seed source when D1 is empty.

Writes in production happen through `/api/notes/*` and now use Google OAuth + server-side sessions. Legacy `Authorization: Bearer <SECOND_BRAIN_ADMIN_TOKEN>` is still accepted temporarily for backward compatibility.

## Auth Environment Variables

- `GOOGLE_CLIENT_ID`: Google OAuth web client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (server-side only).
- `ADMIN_GOOGLE_ALLOWLIST`: Comma-separated allowlist of admin Google emails (for example `you@example.com,ops@example.com`).
- `SESSION_TTL_HOURS`: Session lifetime in hours for `ozzy_admin_session` cookie (default: `12`).

## D1 Setup

1. Create the D1 database:

```bash
npx wrangler d1 create ozzy-second-brain-db
```

2. Copy the `database_id` from the command output and apply it automatically to `wrangler.jsonc`:

```bash
node scripts/configure-d1.mjs <DATABASE_ID_UUID>
```

3. Apply migrations locally:

```bash
npx wrangler d1 migrations apply ozzy-second-brain-db --local
```

4. Apply migrations remotely:

```bash
npx wrangler d1 migrations apply ozzy-second-brain-db --remote
```

5. Set Google OAuth/admin auth secrets:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put ADMIN_GOOGLE_ALLOWLIST
```

6. Optional backward-compatible legacy bearer token:

```bash
npx wrangler secret put SECOND_BRAIN_ADMIN_TOKEN
```

## Local Development

```bash
npm run dev
```

Open `http://localhost:3000`.

For local API write auth/session configuration, set:

```bash
export GOOGLE_CLIENT_ID='your-google-client-id'
export GOOGLE_CLIENT_SECRET='your-google-client-secret'
export ADMIN_GOOGLE_ALLOWLIST='you@example.com,ops@example.com'
export SESSION_TTL_HOURS='12'
```

## Deploy

```bash
npm run build
npm run deploy
```

## Verify After Deploy

1. Docs listing should render notes:

```bash
curl https://brain.tonyreviewsthings.com/docs
```

2. Build ID API should match static build ID:

```bash
curl https://brain.tonyreviewsthings.com/api/build-id
curl https://brain.tonyreviewsthings.com/BUILD_ID
```

3. Authenticated write/read roundtrip:

```bash
TOKEN='your-admin-token'
BASE='https://brain.tonyreviewsthings.com'

curl -X PUT "$BASE/api/notes/journal/d1-smoke-test" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"title":"D1 Smoke Test","content":"# D1 Smoke Test\n\nPersistent write check.","tags":["smoke","d1"]}'

curl "$BASE/api/notes/journal/d1-smoke-test"

curl -X DELETE "$BASE/api/notes/journal/d1-smoke-test" \
  -H "Authorization: Bearer $TOKEN"
```
