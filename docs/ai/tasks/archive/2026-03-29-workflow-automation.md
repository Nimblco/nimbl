# Task Brief

## Summary

- task: automate workflow artifact scaffolding and stricter workflow validation
- requested outcome: make the repo workflow executable through predictable CLI defaults instead of relying on agent memory
- primary constraint: extend the existing `pnpm workflow` surface without inventing a second workflow system

## Linked artifacts

- spec: `docs/specs/archive/2026-03-29-workflow-automation.md`
- plan: `docs/plans/archive/2026-03-29-workflow-automation.md`

## Current state

- status: completed
- current owner: codex
- next action: archive the workflow bundle when the change is accepted
- blockers: none

## Progress checklist

- [x] define approved scope for workflow automation
- [x] create aligned task brief, spec, and plan
- [x] add failing tests for scaffold and validation behavior
- [x] implement CLI automation and doc updates
- [x] run verification and capture remaining risks

## Scope

- in scope: add non-interactive workflow scaffolding; strengthen `workflow check`; update workflow docs to use the new default flow
- out of scope: interactive workflow prompts; automated handoff-contract parsing or generation; broad repo restructuring

## File ownership

- planner: `docs/ai/tasks/archive/2026-03-29-workflow-automation.md`, `docs/specs/archive/2026-03-29-workflow-automation.md`, `docs/plans/archive/2026-03-29-workflow-automation.md`
- implementer: `scripts/workflow-lib.mjs`, `scripts/init-workflow.mjs`, `tests/workflow-cli.test.mjs`, `docs/ai/commands.md`, `docs/ai/quickstart.md`, `docs/ai/subagents/README.md`, `docs/ai/subagents/planner.md`, `docs/ai/subagents/handoff-contract.md`, `docs/ai/decisions.md`
- reviewer: `tests/workflow-cli.test.mjs`, `scripts/workflow-lib.mjs`, linked docs
- tester: `tests/workflow-cli.test.mjs`, `docs/ai/commands.md`

## Relevant files

- `scripts/workflow-lib.mjs`: existing workflow CLI implementation
- `tests/workflow-cli.test.mjs`: workflow CLI regression coverage
- `docs/ai/commands.md`: canonical workflow command list
- `docs/ai/quickstart.md`: shortest-path workflow instructions
- `docs/ai/subagents/README.md`: subagent sequence and artifact rules
- `docs/ai/subagents/planner.md`: planner artifact expectations
- `docs/ai/subagents/handoff-contract.md`: shared contract that should align with stricter workflow checks
- `docs/ai/decisions.md`: durable workflow tradeoffs
- `scripts/init-workflow.mjs`: starter injector that seeds command guidance into downstream repos

## Acceptance criteria

- criterion 1: `pnpm workflow scaffold` can create a dated task brief plus optional matching spec and plan using aligned filenames and linked paths
- criterion 2: `pnpm workflow check` reports missing required workflow fields and inconsistent linked artifacts more clearly than the current existence-only validation
- criterion 3: workflow docs point agents toward scaffold -> edit -> check -> handoff/finalize as the default path
- criterion 4: new behavior is covered by automated tests in `tests/workflow-cli.test.mjs`

## Validation

- `node --test tests/workflow-cli.test.mjs`
- `node --test`

## Risks or dependencies

- risk 1: stricter validation could reject older task briefs unless the rules stay compatible with existing templates
- risk 2: scaffold defaults must be opinionated enough to help agents without forcing unnecessary spec/plan files for small tasks

## Handoff notes

- keep scaffold non-interactive-first with explicit flags so agents and scripts can call it deterministically
- prefer backward-compatible validation that accepts explicit `none` for omitted linked artifacts
