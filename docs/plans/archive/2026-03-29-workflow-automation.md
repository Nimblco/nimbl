# Workflow Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add non-interactive workflow scaffolding and stronger task-brief validation to the existing workflow CLI.

**Architecture:** Extend `scripts/workflow-lib.mjs` with one new command and a richer validation path, then lock the behavior in with `node:test` coverage. Update the workflow docs so the generated artifacts and command sequence stay aligned with the new CLI behavior.

**Tech Stack:** Node.js ES modules, `node:test`, Markdown workflow docs

---

## References

- spec: [2026-03-29-workflow-automation.md](../specs/2026-03-29-workflow-automation.md)
- task brief: [2026-03-29-workflow-automation.md](../ai/tasks/2026-03-29-workflow-automation.md)
- product doc: none

### Task 1: Add regression coverage for scaffold and validation rules

**Files:**
- Modify: `tests/workflow-cli.test.mjs`
- Read: `scripts/workflow-lib.mjs`

- [ ] **Step 1: Write the failing scaffold and validation tests**

Add `node:test` cases that call `runCli(["scaffold", "--slug", "workflow-automation", "--artifacts", "bundle"], { repoRoot })`, `runCli(["scaffold", "--slug", "docs-tweak", "--artifacts", "task"], { repoRoot })`, and `runCli(["check"], { repoRoot })` against fixtures missing `status`, `next action`, or linking `plan` without `spec`.

- [ ] **Step 2: Run the workflow CLI test file and verify the new cases fail for the expected reason**

Run: `node --test tests/workflow-cli.test.mjs`
Expected: FAIL because `workflow-lib.mjs` does not yet recognize `scaffold` and does not yet reject the stricter invalid task-brief shapes.

### Task 2: Implement scaffold generation and stronger validation

**Files:**
- Modify: `scripts/workflow-lib.mjs`
- Test: `tests/workflow-cli.test.mjs`

- [ ] **Step 1: Add scaffold parsing and file generation**

Implement CLI argument parsing for `workflow scaffold --slug <topic> --artifacts task|bundle`, generate dated filenames under `docs/ai/tasks`, `docs/specs`, and `docs/plans`, and write default markdown content that links the generated artifacts with explicit `none` when omitted.

- [ ] **Step 2: Tighten workflow validation**

Require `status` and `next action`, keep path validation, and add a consistency rule that rejects a linked plan when no linked spec is present. Return all issues through the existing `Workflow check failed:` format.

- [ ] **Step 3: Re-run the workflow CLI test file**

Run: `node --test tests/workflow-cli.test.mjs`
Expected: PASS for scaffold coverage and existing workflow behavior.

### Task 3: Align the docs with the new mechanical workflow

**Files:**
- Modify: `docs/ai/commands.md`
- Modify: `docs/ai/quickstart.md`
- Modify: `docs/ai/subagents/README.md`
- Modify: `docs/ai/subagents/planner.md`
- Modify: `docs/ai/subagents/handoff-contract.md`
- Modify: `docs/ai/decisions.md`

- [ ] **Step 1: Update command and quickstart docs**

Document `workflow scaffold` as the preferred entrypoint, show both task-only and bundle usage, and keep `check`, `handoff`, and `finalize` as the follow-on commands.

- [ ] **Step 2: Update subagent guidance and durable decisions**

Clarify that planners should prefer scaffolding aligned artifacts instead of creating them ad hoc, note explicit `none` handling where relevant, and record the non-interactive-first workflow choice in `docs/ai/decisions.md`.

- [ ] **Step 3: Run the full repo test command**

Run: `node --test`
Expected: PASS with the workflow CLI coverage included.

## Validation

- [ ] Run `node --test tests/workflow-cli.test.mjs`.
- [ ] Run `node --test`.

## Risks

- risk 1: generated defaults may need future updates when templates evolve
- risk 2: older task briefs that omitted `status` or `next action` implicitly will now fail check until corrected

## Handoff notes

- keep artifact filenames aligned around the same date-and-topic slug
- use explicit `none` values for omitted spec/plan links so later tools do not have to infer intent
