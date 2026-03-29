# Nimblco — Agentic Workflow Layer

[![npm version](https://img.shields.io/npm/v/nimblco.svg)](https://www.npmjs.com/package/nimblco)
[![npm downloads](https://img.shields.io/npm/dm/nimblco.svg)](https://www.npmjs.com/package/nimblco)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A portable workflow layer you can embed into any repository — new or existing, any language or stack — to give AI coding agents a consistent operating model.

The goal is to keep durable context, planning artifacts, and task state in the repository so people and coding agents can resume work from the repo itself instead of relying on chat history.

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

After installing, teams replace the starter placeholders with their actual product context:

- `docs/ai/project-context.md` for durable product facts
- `docs/ai/architecture.md` for current system shape and boundaries
- `docs/ai/decisions.md` for durable engineering decisions
- `docs/ai/future-work.md` for deferred work and known gaps

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

## Quick start

### Install into an existing or new repo

> **Prerequisite:** Node.js >= 18 is required to run the installer, but the installed workflow layer works in any repository regardless of language or stack.

```bash
npx nimblco <target-directory>
```

This runs the interactive setup wizard, copies the workflow layer into your target repo, and injects the `workflow` scripts into your existing `package.json` if one is present.

**Flags:**

| Flag | Description |
|------|-------------|
| `-y`, `--yes` | Accept all defaults (non-interactive) |
| `-f`, `--force` | Overwrite existing files |
| `--include-archives` | Copy archived task/spec/plan history |
| `-h`, `--help` | Show help |

### Use the workflow CLI in your repo

```bash
# Create a task brief + spec + plan for a new piece of work
pnpm workflow scaffold --slug <topic> --artifacts bundle

# Validate the active task brief and linked artifacts
pnpm workflow check

# Export a portable handoff pack for another AI tool
pnpm workflow pack --to gemini

# Archive a completed bundle
pnpm workflow finalize
```

See `docs/ai/quickstart.md` for the full workflow onboarding guide.

### Develop or contribute to this repo

This repo does not require Corepack. If `pnpm` is not installed globally, run it through `npm exec --yes -- pnpm ...` instead.

```bash
npm exec --yes -- pnpm install
./scripts/check.sh
```

```powershell
npm.cmd exec --yes -- pnpm install
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

## License

[MIT](LICENSE)
