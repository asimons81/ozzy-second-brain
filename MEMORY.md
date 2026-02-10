# MEMORY.md - Long-Term Memory

> Your curated memories. Distill from daily notes. Remove when outdated.

---

## About Tony Simons

### Key Context
- ISU day job (locked in for 5 more years for vesting)
- Second job (custodian) takes him away from family—this is what needs replacing
- Goal: Replace second job income with remote/flexible work

### Preferences Learned
- Direct, high-signal communication. No glazing.
- Calls out bad ideas. Improves meh ones.
- Only values praise for real accomplishments.
- Family time (nights/weekends) is sacred.

### Important Dates
- **March 20, 2026:** Ruby turns 1 (Great Dane)
- **May 31, 2026:** Carl turns 10 (Shih Tsu/Jack Russell mix)

---

## Lessons Learned

### 2026-02-08 - Systemd Service Types
- One-shot maintenance scripts (like `scanner.py`) should use `Type=oneshot` in systemd units. Using `Type=simple` causes the service to "fail" immediately upon script completion, triggering unnecessary restart loops.

### 2026-02-08 - Skill Dependency Hygiene
- Custom or local skills in the workspace (like `brave-search`) may lose dependencies after system updates. Always check `npm list` in the skill folder if a tool starts throwing "module not found" errors.

### 2026-02-08 - Sparkline History Pattern
- When building dashboards that track metrics over time, maintain a separate history file rather than bloating the main data file. Use a rolling window (e.g., 7 days) to prevent unbounded growth. SVG sparklines are perfect for inline trends—lightweight, scalable, and don't require chart libraries.

### 2026-02-08 - Migration Efficiency (God Mode)
- **Identity Retention**: Migration kits for OpenClaw should always include `openclaw.json` and `OpenClaw-key.pem` to avoid manual re-pairing.
- **Hardware Bottlenecks**: BIOS-level virtualization (SVM/VT-x) is the #1 cause of WSL installation hangs on new gaming hardware. Always check the ASRock/Advanced/CPU menu first.
- **Verification Scripting**: A simple `god-mode-check.sh` benchmarking CPU/RAM/GPU/Disk gives the user instant gratification and verification of their hardware upgrade.

### 2026-02-09 - Brain Sync & Git Hygiene
- **Nested Repos**: Embedded `.git` folders in subdirectories (like `node_modules` or sub-projects) block top-level `git stash` and `git pull --rebase`. Flatten the structure by removing embedded `.git` metadata to maintain a unified brain.
- **Node Modules Tracking**: Ensure `.gitignore` uses `node_modules/` (not `/node_modules`) to ignore dependencies in all sub-levels and prevent large binary bloat from hitting GitHub limits.

---

## Ongoing Context

### Active Projects
- **Mac Mini Challenge**: Goal: Earn $1,200 by April 1, 2026 via monetization (Tool Takedown newsletter, Ozzy Captions licenses, NOVA videos).
- **New Architecture**:
  - **Ozzy (Me)**: Strategy/Content/Coordination (Chromebook).
  - **Sid (New Agent)**: Heavy Compute/Rendering/Local LLMs (Gaming Rig).
- **Collaboration**: Shared Brain repo (`ozzy-second-brain`) using a "Job Ticket" protocol in `notes/sid-queue/`.
- **Local LLM**: Llama 3.2 3B installed via Ollama. Accepted that 8B+ models will be the target for the new desktop hardware.
- **Ozzy Captions**: React/Next.js tool. Strategy: Hybrid Model. Status: Audit complete, build fixed, market-ready.

- **Trend Sniping**: Hourly automated X engagement for OpenClaw/AI Agent trends.
- **Hacker News (2026-02-08)**: OpenClaw trended on Hacker News (#16) with a major user endorsement ("OpenClaw is changing my life").
- **NOVA (Video Agent)**: Successfully launched as the specialist video production employee. Developed a Cyber-Industrial aesthetic (OLED Black/Neon Teal) using Remotion. First production: "LocalGPT in Rust."
- **SmugMug Migration (2026-02-07)**: Successfully migrated 3,493/3,495 photos to Google Photos using a custom headless CLI migrator. Migration completed on 2026-02-08. Status: COMPLETE.
- **Gateway Stability**: Fixed persistent `undici` TLS crash loop and service path issues.

---

*Review and update periodically. Daily notes are raw; this is curated.*
