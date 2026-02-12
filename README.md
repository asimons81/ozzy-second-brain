# OZZY Second Brain

Local-first Next.js workspace for writing and browsing markdown notes under `content/*`.

## Getting Started

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Add Notes From UI

The app now supports local markdown authoring with frontmatter.

1. Click `+ Capture` in the top bar, or press `Ctrl/Cmd+K` and run `New note`.
2. Fill in `Title`, `Category`, optional `Tags`, and markdown `Body`.
3. Press `Ctrl/Cmd+Enter` or click `Create note`.
4. The note is written to `content/<category>/<slug>.md` and opened immediately.

## Edit Existing Notes

1. Open any `/docs/[category]/[slug]` page.
2. Click `Edit`.
3. Update title/tags/body and save with `Ctrl/Cmd+Enter`.

Save updates:

- Preserve unknown frontmatter keys.
- Set `modified: <iso>` in frontmatter.
- Update `content/.index/recents.json` for latest activity.

## Notes Architecture

- Category config: `lib/categories.ts`
- Markdown loading/parsing: `lib/brain.ts`
- Server actions for create/edit: `app/actions/notes.ts`
- Recents index utilities: `lib/recents.ts`
- Quick Capture UI: `components/QuickCaptureModal.tsx`
- Global top-bar actions: `components/GlobalActions.tsx`
