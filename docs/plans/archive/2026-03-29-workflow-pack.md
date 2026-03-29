# Workflow Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a markdown handoff-pack exporter to the workflow CLI so another LLM or IDE can resume work from one portable file.

**Architecture:** Extend `scripts/workflow-lib.mjs` with one new `pack` command that reuses task selection and prompt generation, then layers in file output plus git-derived change context. Cover the new paths in `tests/workflow-cli.test.mjs` and update workflow docs so the export path is discoverable.

**Tech Stack:** Node.js ES modules, `node:test`, Markdown workflow docs, git CLI

---

## References

- spec: [2026-03-29-workflow-pack.md](../specs/2026-03-29-workflow-pack.md)
- task brief: [2026-03-29-workflow-pack.md](../ai/tasks/2026-03-29-workflow-pack.md)
- product doc: none

### Task 1: Add regression coverage for workflow pack

**Files:**
- Modify: `tests/workflow-cli.test.mjs`
- Read: `scripts/workflow-lib.mjs`

- [ ] **Step 1: Write failing pack tests**

Add `node:test` cases for:
- `runCli(["pack"], { repoRoot })` writing `docs/ai/handoffs/<task>-handoff.md`
- `runCli(["pack", "--stdout"], { repoRoot })` returning the pack text directly
- `runCli(["pack", "--copy"], { repoRoot, clipboardWriter })` copying the generated pack
- `runCli(["pack", "--include-diff"], { repoRoot })` adding a diff section
- `runCli(["pack", "--to", "gemini"], { repoRoot })` including a gemini-targeted prompt block

- [ ] **Step 2: Run the workflow CLI test file and confirm the new cases fail**

Run: `node --test tests/workflow-cli.test.mjs`
Expected: FAIL because `workflow-lib.mjs` does not yet recognize `pack` or generate handoff-pack markdown output.

### Task 2: Implement the workflow pack command

**Files:**
- Modify: `scripts/workflow-lib.mjs`
- Test: `tests/workflow-cli.test.mjs`

- [ ] **Step 1: Add pack argument parsing and markdown rendering**

Implement `workflow pack` with support for `--task`, `--to`, `--stdout`, `--copy`, `--output`, and `--include-diff`. Reuse task resolution and prompt generation, write the default handoff file under `docs/ai/handoffs/`, and include graceful fallback text when git status or diff details are unavailable.

- [ ] **Step 2: Re-run the workflow CLI test file**

Run: `node --test tests/workflow-cli.test.mjs`
Expected: PASS for the new pack coverage and existing workflow commands.

### Task 3: Update workflow docs and starter guidance

**Files:**
- Modify: `docs/ai/commands.md`
- Modify: `docs/ai/quickstart.md`
- Modify: `docs/ai/decisions.md`
- Modify: `scripts/init-workflow.mjs`

- [ ] **Step 1: Document the new pack flow**

Add `workflow pack` command examples and explain that it is the portable export path when another LLM or IDE needs a compact handoff package.

- [ ] **Step 2: Run the full repo test command**

Run: `node --test`
Expected: PASS with the workflow pack coverage included.

## Validation

- [ ] Run `node --test tests/workflow-cli.test.mjs`.
- [ ] Run `node --test`.

## Risks

- risk 1: git-derived data may differ between clean and dirty worktrees
- risk 2: pack templates may need maintenance when workflow docs evolve

## Handoff notes

- keep the default pack markdown compact and human-readable
- only include raw diff content when `--include-diff` is set
