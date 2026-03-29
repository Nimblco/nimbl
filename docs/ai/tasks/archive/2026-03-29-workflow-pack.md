# Task Brief

## Summary

- task: add portable workflow handoff pack generation
- requested outcome: let the repo export a compact markdown handoff bundle that another LLM or IDE can consume without needing the raw chat transcript
- primary constraint: keep the pack small and deterministic by default, with diff details only when explicitly requested

## Linked artifacts

- spec: `docs/specs/archive/2026-03-29-workflow-pack.md`
- plan: `docs/plans/archive/2026-03-29-workflow-pack.md`

## Current state

- status: completed
- current owner: codex
- next action: archive the workflow bundle when the change is accepted
- blockers: none

## Progress checklist

- [x] approve the workflow pack direction and default compact format
- [x] create aligned task brief, spec, and plan
- [x] add failing tests for pack generation and transport options
- [x] implement workflow pack and update docs
- [x] run verification and capture remaining risks

## Scope

- in scope: add `workflow pack`; write pack markdown files by default; support `--to`, `--stdout`, `--copy`, `--output`, and `--include-diff`; document the pack flow
- out of scope: raw session transcript export; JSON pack export; automatic ingestion by external IDEs

## File ownership

- planner: `docs/ai/tasks/archive/2026-03-29-workflow-pack.md`, `docs/specs/archive/2026-03-29-workflow-pack.md`, `docs/plans/archive/2026-03-29-workflow-pack.md`
- implementer: `scripts/workflow-lib.mjs`, `tests/workflow-cli.test.mjs`, `docs/ai/commands.md`, `docs/ai/quickstart.md`, `docs/ai/decisions.md`, `scripts/init-workflow.mjs`
- reviewer: `scripts/workflow-lib.mjs`, `tests/workflow-cli.test.mjs`, linked docs
- tester: `tests/workflow-cli.test.mjs`, `docs/ai/commands.md`

## Relevant files

- `scripts/workflow-lib.mjs`: workflow CLI entrypoints, prompt generation, validation, and new pack behavior
- `tests/workflow-cli.test.mjs`: regression coverage for workflow CLI commands
- `docs/ai/commands.md`: canonical workflow command list
- `docs/ai/quickstart.md`: user-facing workflow path
- `docs/ai/decisions.md`: durable workflow decisions
- `scripts/init-workflow.mjs`: starter injector that seeds command guidance into downstream repos

## Acceptance criteria

- criterion 1: `pnpm workflow pack` writes a markdown handoff file under `docs/ai/handoffs/` for the selected task
- criterion 2: the pack includes task state, linked artifacts, validation commands, relevant files, changed-file list, and a ready-to-paste prompt
- criterion 3: `--stdout`, `--copy`, and `--output` make the pack usable without manual file hunting
- criterion 4: `--include-diff` adds git diff details only when explicitly requested
- criterion 5: workflow docs explain when to use `workflow pack`

## Validation

- `node --test tests/workflow-cli.test.mjs`
- `node --test`

## Risks or dependencies

- risk 1: pack generation depends on git status and diff commands, so non-git repos or unexpected git errors need clear fallback behavior
- risk 2: including too much detail by default could make the handoff pack less portable across LLMs with tighter token limits

## Handoff notes

- default pack output should remain compact and markdown-first
- changed-file list should be included by default, with diff content behind `--include-diff`
