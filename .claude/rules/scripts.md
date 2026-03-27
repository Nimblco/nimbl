---
paths:
  - "scripts/**/*"
  - "**/*.ps1"
  - "**/*.sh"
---

# Script Rules

- Keep scripts idempotent when possible.
- Prefer readable command sequences over dense shell tricks.
- When adding a project-specific command, update `docs/ai/commands.md` in the same change.
