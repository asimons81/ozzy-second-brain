# Dev Smoke Tests

## Preconditions
- Local D1 migrations applied.
- App running with write access and admin auth.

## Core idea actions
1. Approve an idea from `/ideas`.
Expected:
- Idea is removed from `ideas`.
- Note appears in `approved-ideas`.

2. Reject an idea with a reason.
Expected:
- Idea is removed from `ideas`.

3. Mark an idea as Needs Work with feedback.
Expected:
- Idea remains in `ideas`.
- Note frontmatter has:
  - `tags` includes `needs-work` and excludes `approved`
  - `needs_work_feedback` updated to latest feedback
  - `needs_work_at` updated to current ISO timestamp

4. Delete an idea.
Expected:
- Idea is removed from `ideas`.

## Partial-success scenario (required contract)
Simulate: note operation succeeds, but D1 decision logging fails.

Expected server action response:
```json
{ "success": false, "error": "Decision logging failed after note update/move/delete." }
```

Expected UI behavior in idea card:
- Error string is shown verbatim:
  - `Decision logging failed after note update/move/delete.`
- Card remains visible (`success:false`).

## Validation commands
```bash
npx tsc --noEmit
npm run build
rg -n "sid-queue|\\.archive|draft-content|assigned_to|source_idea" app/actions/ideas.ts app lib components
rg -n "\\bfs\\b|\\bpath\\b" app/actions/ideas.ts
```
