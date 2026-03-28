---
name: Portable Handoff
summary: Keep active work portable across IDEs, models, and sessions.
when_to_use:
  - resuming or continuing in-progress work
  - switching tools or handing work to another agent
  - preparing a compact status update inside the repo
triggers:
  keywords:
    - continue
    - current task
    - handoff
    - resume
    - switch ide
    - switch model
  files:
    - docs/ai/current-task.md
    - AGENTS.md
references:
  - docs/ai/current-task.md
  - docs/ai/portability.md
  - docs/ai/decisions.md
---

# Portable Handoff

## Goal

Make active context survive tool switches without depending on chat history.

## Workflow

1. Read `docs/ai/current-task.md` before continuing active work.
2. Confirm the goal, files in play, assumptions, next step, and validation state.
3. Refresh `docs/ai/current-task.md` whenever the active goal or next step changes materially.
4. Keep the file brief so another agent can rehydrate context quickly.

## Guardrails

- store durable context in shared docs, not tool-only memory
- use this file for active work status, not as a long-form diary
- record blockers and validation gaps explicitly

## Validation

- make sure `docs/ai/current-task.md` reflects the latest meaningful state before handoff
