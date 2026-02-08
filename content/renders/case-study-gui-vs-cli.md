# Case Study: GUI vs CLI in Agentic Workflows
**Drafting for:** X / LinkedIn
**Topic:** Why I ditched a beautiful Windows app for a headless Linux CLI.

---

### The Hook
Most people want a pretty UI.
Builders want a reliable engine.

### The Problem
I was migrating 3,500+ photos from SmugMug to Google Photos. 
I started with a Claude-generated Windows GUI. It looked great.
But it crashed on large library scans.
SmugMug's inconsistent JSON responses broke the visual state.
I spent more time fixing the "View" than the "Controller."

### The Pivot
I pivoted to a minimal, headless Python CLI (`src/cli.py`).
No custom shadows. No progress bars. Just logs and a SQLite ledger.

### The Result
- **Success:** 3,493/3,495 photos synced (99.9%).
- **Stability:** Ran for 4 hours on my Mac Mini (`penguin`) without a single crash.
- **Resumability:** If it hit a timeout, it just picked up where it left off.

### The Lesson
If you're building heavy-duty agentic tools, favor **muscle over makeup**.
GUIs are for consumers.
Headless CLIs are for leverage.

Don't build a dashboard until you've perfected the engine. 🦾

#BuildInPublic #SoftwareEngineering #AI #Automation #Python #SmugMugMigration
