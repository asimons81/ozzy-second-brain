# The Second Brain

**Status:** Active Development
**Stack:** Next.js, Tailwind, Markdown
**Goal:** A "Linear-meets-Obsidian" viewer for Tony's knowledge base.

## Architecture
- **Source of Truth:** The `brain/` directory in the workspace.
- **Frontend:** A Next.js app running locally (or deployed).
- **Sync:** The agent (Ozzy) writes Markdown files directly to `brain/`. The app reads them.

## Structure
- `brain/journal/`: Daily logs of work, decisions, and chats.
- `brain/concepts/`: Evergreen notes on tech, strategy, and projects.

## Why this matters
Tony works 7:30-4:00. He can't keep everything in his head. This system allows Ozzy to "offload" context into a format that Tony can browse visually, rather than reading raw text files or scrolling through chat history.
