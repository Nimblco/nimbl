---
name: scripts
description: Guidelines for editing shell scripts, PowerShell files, and workflow scripts in a Nimblco-managed repo. Use when modifying files in scripts/, *.ps1, or *.sh.
license: MIT
---

# Script Rules

- Keep scripts idempotent when possible.
- Prefer readable command sequences over dense shell tricks.
- When adding or changing a project-specific command, update `docs/ai/commands.md`.
- Provide both a `.ps1` (PowerShell) and a `.sh` (Bash) version for scripts that users run directly.
- Do not add unrelated changes to script files when fixing a targeted issue.
