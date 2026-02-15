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

## Approved idea reversal actions
1. Approve -> Revert (from `/docs/approved-ideas/{slug}` via "Move back to Ideas").
Expected:
- Redirect to `/docs/ideas/{slug}`.
- Idea appears in `ideas`.
- Idea is removed from `approved-ideas`.
- A decision row exists with `decision = 'reverted'`.

2. Approve -> Reject (from `/docs/approved-ideas/{slug}` via "Reject" with reason).
Expected:
- Redirect to `/docs/approved-ideas`.
- Idea is removed from `approved-ideas`.
- A decision row exists with:
  - `decision = 'rejected'`
  - `reason` set to entered value.

## Partial-success scenario (required contract)
Simulate: note operation succeeds, but D1 decision logging fails.

Expected server action response:
```json
{ "success": false, "error": "Decision logging failed after note update/move/delete." }
```

Expected UI behavior in idea card/approved-idea actions panel:
- Error string is shown verbatim (no paraphrase):
  - `Decision logging failed after note update/move/delete.`
- Item/page remains visible (`success:false`) and there is no redirect.

## Validation commands
```bash
npx tsc --noEmit
npm run build
rg -n "sid-queue|\\.archive|draft-content|assigned_to|source_idea" app/actions/ideas.ts app lib components
rg -n "\\bfs\\b|\\bpath\\b" app/actions/ideas.ts
```

## Idea decisions history API
Fetch last 10 decisions:
```bash
curl -sS "http://localhost:3000/api/ideas/decisions?limit=10" \
  -H "Authorization: Bearer $SECOND_BRAIN_ADMIN_TOKEN"
```

Fetch decisions for a slug:
```bash
curl -sS "http://localhost:3000/api/ideas/decisions?slug=example-idea&limit=10" \
  -H "Authorization: Bearer $SECOND_BRAIN_ADMIN_TOKEN"
```
