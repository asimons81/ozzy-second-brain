# Engineering Note: Agentic Micro-Service Stability
**Date:** 2026-02-08
**Topic:** Systemd Service Types for One-Shot Utilities

### The Problem
Agents often need to run periodic "one-shot" scripts (e.g., `scanner.py` for quota tracking). Using the default `Type=simple` in systemd units causes a stability loop. 

Systemd expects a `simple` service to stay alive. When the script finishes successfully, systemd sees a "dead" process and immediately restarts it (if `Restart=always` is set). This results in high CPU usage and unnecessary API calls.

### The Solution: `Type=oneshot`
By switching to `Type=oneshot`, we tell the OS: "This process is designed to run and then exit."

### Configuration
```ini
[Service]
Type=oneshot
WorkingDirectory=/path/to/script
ExecStart=/usr/bin/python3 script.py
# No 'Restart=always' needed for one-shots
```

### Why it Matters for Ozzy
In an agentic ecosystem, stability is leverage. We don't want "zombie" services burning tokens or compute. We want deterministic execution.

Architecture over syntax. Always. 🦾
