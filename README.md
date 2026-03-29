# Reusable Workflow Layer For One-Product Repos

This repo is a starter for teams that want a reusable workflow layer around a single product codebase. It is not meant to be a catalog of unrelated products. The goal is to keep durable context, planning artifacts, and task state in the repository so people and coding agents can resume work from the repo itself instead of chat history.

## The three layers

### 1. Reusable workflow layer

This starter provides the shared operating model:

- `AGENTS.md` as the repo playbook
- `docs/ai/commands.md` and `docs/ai/standards.md` as the always-read baseline
- `docs/specs/`, `docs/plans/`, and `docs/ai/tasks/` as the continuity artifacts
- `docs/ai/subagents/` for planner, implementer, reviewer, and tester role definitions
- `scripts/bootstrap.*`, `scripts/check.*`, and the workflow CLI as reusable helpers
- thin tool adapters for Codex, Claude Code, GitHub Copilot, Gemini, Antigravity, and similar tools

Preserve this layer unless you are intentionally changing how the workflow works.

### 2. Product-owned layer

Downstream teams replace the starter placeholders with their actual product context:

- `docs/ai/project-context.md` for durable product facts
- `docs/ai/architecture.md` for current system shape and boundaries
- `docs/ai/decisions.md` for durable engineering decisions
- `docs/ai/future-work.md` for deferred work and known gaps
- `apps/`, `packages/`, and other product code or docs

This is where the repo should start sounding like the real product instead of the starter.

### 3. Execution layer

Active work lives in committed workflow artifacts:

- `docs/specs/` for approved behavior, architecture, or workflow specs
- `docs/plans/` for implementation steps
- `docs/ai/tasks/` for current task status, handoff notes, and validation state

This layer changes often. Archive or replace it as work moves forward.

## How teams use this starter

1. Read `AGENTS.md` and the always-read docs in `docs/ai/`.
2. Use `docs/ai/quickstart.md` for the practical workflow onboarding, including how to run the spec/plan/task loop.
3. Replace the starter placeholders in the product-owned layer with real product context.
4. For behavior, architecture, workflow, or multi-step work, create or update a spec in `docs/specs/`.
5. Create or update the matching plan in `docs/plans/`.
6. Create or update a task brief in `docs/ai/tasks/` for every non-trivial change.
7. Run the documented validation commands before handoff or review.

## Tool portability

The workflow layer is designed to stay portable across tools. Keep the shared guidance in `AGENTS.md`, and keep tool-specific files as adapters rather than separate workflow systems.

- `CLAUDE.md` and `.claude/rules/` cover Claude Code compatibility
- `GEMINI.md` stays minimal for Gemini-compatible tools
- `.github/copilot-instructions.md`, `.github/instructions/`, and `.github/prompts/` cover GitHub Copilot
- `.agent/` holds Antigravity rules and workflows

## Workspace shape

The starter uses a `pnpm` workspace layout for JavaScript or TypeScript repos. Use `apps/` for the product's runnable surfaces and `packages/` for shared code or configuration that supports that same product.

## Quick start

This starter does not require Corepack. If `pnpm` is not installed globally, run it through `npm exec --yes -- pnpm ...` instead. In PowerShell, use `npm.cmd` to avoid execution-policy issues with `npm.ps1`.

For the actual repo workflow onboarding, read `docs/ai/quickstart.md`. The commands below are just the environment bootstrap and validation entry points.

```powershell
npm.cmd exec --yes -- pnpm install
./scripts/bootstrap.ps1
./scripts/check.ps1
```

If PowerShell blocks direct script execution, use:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

```bash
npm exec --yes -- pnpm install
./scripts/bootstrap.sh
./scripts/check.sh
```
