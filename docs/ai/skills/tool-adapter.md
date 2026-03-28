---
name: Tool Adapter
summary: Keep Codex, Copilot, Gemini, Claude, and Antigravity adapters thin and aligned.
when_to_use:
  - updating agent setup or instruction files
  - changing portability rules
  - adding or refining tool-specific adapters
triggers:
  keywords:
    - adapter
    - agent setup
    - antigravity
    - claude
    - copilot
    - gemini
    - ide
    - llm
    - prompt portability
    - tooling
  files:
    - CLAUDE.md
    - GEMINI.md
    - .github/**/*
    - .agent/**/*
    - docs/ai/portability.md
    - docs/ai/tool-support-matrix.md
references:
  - AGENTS.md
  - docs/ai/portability.md
  - docs/ai/tool-support-matrix.md
  - docs/ai/current-task.md
---

# Tool Adapter

## Goal

Support multiple IDEs and models without creating multiple sources of truth.

## Workflow

1. Keep shared rules and workflow in repo-owned docs.
2. Make each adapter point back to `AGENTS.md` and shared docs.
3. Add tool-specific instructions only when the behavior cannot live cleanly in shared docs.
4. Keep adapter changes small and verify they still align with the shared playbook.

## Guardrails

- do not duplicate large rulebooks across tool files
- keep vendor-specific prompts and workflows optional
- prefer skills and shared docs over tool-private memory

## Validation

- confirm the adapter still points to shared docs instead of drifting into a separate playbook
