# OZZY Second Brain

Local-first Next.js workspace for writing and browsing markdown notes under `content/*`.

## Vercel Build Root Cause (Fixed)

The failing Vercel build was caused by an invalid non-UTF8 byte in `components/CommandPalette.tsx` (a Windows-encoded bullet character `0x95`), which made Turbopack fail during source parsing (`failed to convert rope into string`). This has been fixed by normalizing the file content to valid UTF-8 and replacing that separator with ASCII.

This app also uses Server Actions for note create/edit, so deployment must use `next build` on the Next.js server runtime (not static export / `next export`).

## Getting Started

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Storage Modes

The app now uses a storage adapter (`lib/storage.ts`) so local workflows keep writing to files, while Vercel can run safely in ephemeral mode.

- `local` mode:
  Writes markdown to `<dataDir>/<category>/<slug>.md`.
  Default `dataDir` is `content/`.
- `tmp` mode:
  Writes to `/tmp/second-brain` (or `SECOND_BRAIN_DATA_DIR` if set).
  Data is ephemeral and may disappear between requests/deployments.

Selection rules:

- If `SECOND_BRAIN_STORAGE` is set, it wins (`local` or `tmp`).
- If running on Vercel (`VERCEL` env present) and no explicit storage mode is set, default is `tmp`.
- Otherwise default is `local`.

Environment variables:

- `SECOND_BRAIN_STORAGE=local|tmp`
- `SECOND_BRAIN_DATA_DIR=/absolute/or/relative/path`

## Add Notes From UI

The app now supports local markdown authoring with frontmatter.

1. Click `+ Capture` in the top bar, or press `Ctrl/Cmd+K` and run `New note`.
2. Fill in `Title`, `Category`, optional `Tags`, and markdown `Body`.
3. Press `Ctrl/Cmd+Enter` or click `Create note`.
4. The note is written to `content/<category>/<slug>.md` and opened immediately.
5. In ephemeral/tmp mode, UI shows a warning banner and saves are not guaranteed to persist.

## Edit Existing Notes

1. Open any `/docs/[category]/[slug]` page.
2. Click `Edit`.
3. Update title/tags/body and save with `Ctrl/Cmd+Enter`.

Save updates:

- Preserve unknown frontmatter keys.
- Set `modified: <iso>` in frontmatter.
- Update runtime recents index (`content/.index/recents.json`) for latest activity.

## Runtime Index Git Hygiene

- `content/.index/recents.json` is a local runtime file and is ignored by git.
- `content/.index/graph.json` is a local runtime backlinks/graph cache and is ignored by git.
- Keep `content/.index/.gitkeep` tracked so the directory exists in fresh clones.

## Wiki Links, Backlinks, Tags

### Wiki links

- Supports Obsidian-style links in markdown body:
  - `[[some note]]`
  - `[[some note|Custom Label]]`
- During doc rendering, wiki links are rewritten to normal markdown links targeting `/wiki/<slug>`.
- `/wiki/[slug]` resolves notes across all categories:
  - exact slug match first
  - then normalized title match
- If not found, `/wiki/[slug]` offers a create CTA that opens Quick Capture prefilled from the missing wiki title.

### Backlinks graph index

- Graph cache file: `content/.index/graph.json`
- Built from all markdown notes using canonical ids: `${category}:${slug}`
- Schema:
  - `nodes`: note metadata
  - `outbound`: links from note -> note ids
  - `inbound`: backlinks to note
- Rebuilt after note create/edit via server actions.
- Missing graph file is handled gracefully and rebuilt on demand.

### Tags

- Tags are normalized on save (`trim + lowercase`).
- Tag browsing pages:
  - `/tags` for all tags + counts
  - `/tags/[tag]` for notes containing that tag (sorted by modified desc)
- Tag chips in note headers are clickable and route to tag pages.

### Brain Panel on docs

- Doc pages now include a panel with:
  - Backlinks (inbound links)
  - Outbound links
  - Related notes (same-tag overlap, top 6)

## Notes Architecture

- Category config: `lib/categories.ts`
- Markdown loading/parsing: `lib/brain.ts`
- Server actions for create/edit: `app/actions/notes.ts`
- Storage adapter + mode detection: `lib/storage.ts`
- Recents helpers: `lib/recents.ts`
- Quick Capture UI: `components/QuickCaptureModal.tsx`
- Global top-bar actions: `components/GlobalActions.tsx`

## Now / Activity / Queue

- `Now` (`/`):
  Unified operational dashboard with active approvals, open Sid tickets, recents, queue preview, and systems links.
- `Activity` (`/activity`):
  Merged timeline from recents index, Sid queue tickets, renders, and approved ideas.
  Includes filters (`All`, `Notes`, `Tickets`, `Renders`) and search.
- `Queue` (`/queue`):
  Pipeline view for `notes/sid-queue/*.json` with derived status:
  `Pending` (no output), `Produced` (output note exists), `Stale` (pending over 24h).
  Ticket detail route: `/queue/[ticketId]` with JSON view and derived links.

## Systems Config

- Systems/subdomain links are configured in root `trt-systems.json`.
- Loader: `lib/systems.ts` (safe fallback if config is missing or invalid).
- Consumers:
  - `Now` dashboard Systems panel
  - Command Palette `Systems` group
