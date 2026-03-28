---
name: Repo Change
summary: Default skill for making small, safe changes in this repository.
when_to_use:
  - implementing features or fixes
  - refactoring code or docs
  - editing scripts or shared repo guidance
triggers:
  keywords:
    - build
    - change
    - docs
    - edit
    - feature
    - fix
    - implement
    - refactor
    - script
    - update
  files:
    - apps/**/*
    - packages/**/*
    - docs/**/*
    - scripts/**/*
    - AGENTS.md
references:
  - docs/ai/commands.md
  - docs/ai/standards.md
  - docs/ai/current-task.md
---

# Repo Change

## Goal

Make the smallest clear change that solves the task and leaves the repo easier for the next agent to understand.

## Workflow

1. Read the relevant files and shared docs before editing.
2. If work is already in progress, refresh `docs/ai/current-task.md`.
3. Keep the change narrowly scoped and avoid unrelated edits.
4. Update docs when behavior, workflow, or architecture changed.
5. Run the most relevant validation command from `docs/ai/commands.md`.
6. Report assumptions, blockers, and follow-up risks.

## Guardrails

- shared docs outrank tool-specific prompt files
- do not overwrite user changes without approval
- prefer clear, repeatable commands and explicit names

## Validation

- run the best available repo check for the files you changed
- if a check cannot run, explain why and record the gap
