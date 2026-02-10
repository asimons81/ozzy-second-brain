# 🚀 Sid's Job Queue

This folder is the handoff point between **Ozzy (The Strategist)** and **Sid (The Muscle)**.

## The Protocol
1.  **Ozzy** identifies a trend and creates a `.json` ticket in this folder.
2.  **Sid** polls this folder (or checks it when pinged).
3.  **Sid** pulls the latest code from the repo.
4.  **Sid** runs the render command using his **GPU**.
5.  **Sid** updates the ticket `status` to "complete" and pushes the final render.

## Render Command Template
```bash
# Inside daily-ai-update/
npx remotion render src/index.ts <CompositionName> out/<OutputName>.mp4 --props '<JSON_DATA>'
```
