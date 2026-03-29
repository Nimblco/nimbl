# Agentic Coding Workspace

A lightweight repository starter for agentic coding workflows across Codex, Claude Code, GitHub Copilot, Gemini, Antigravity, and similar tools.

The goal is simple:

- keep one shared source of truth for project behavior
- make it easy for different agents to understand the repo
- preserve active task context when switching IDEs or LLMs
- keep validation commands consistent across stacks
- support reusable prompts, workflows, path-specific rules, and subagent roles
- leave room for any real app or service to be added later

The repo is now tuned for lean context by default:

- keep root instruction files short
- load deeper docs only when the task needs them
- use subagent files only for work that benefits from role splitting
- use thin root adapters so switching tools does not require rewriting the repo playbook

This repo now defaults to a `pnpm` workspace layout for JavaScript and TypeScript projects.

## What this boilerplate includes

- `AGENTS.md` as the primary repository playbook
- `GEMINI.md` as a thin Gemini-compatible root adapter
- `package.json` and `pnpm-workspace.yaml` for a `pnpm` workspace root
- `apps/` for runnable applications
- `packages/` for shared libraries and configs
- `docs/specs/` for approved specs covering behavior, architecture, and workflow changes
- `docs/plans/` for implementation plans that agents can execute consistently
- `docs/ai/subagents/` for planner, implementer, reviewer, and tester roles
- `docs/ai/tasks/` for live task briefs and execution state
- `docs/ai/tasks/TEMPLATE.md` for task briefs and handoffs
- `.claude/rules/` for Claude Code path-specific rules
- `.agent/` for Antigravity rules and workflows
- `CLAUDE.md` for Claude Code compatibility
- `.github/copilot-instructions.md` for GitHub Copilot
- `.github/instructions/` for Copilot path-specific guidance
- `.github/prompts/` for reusable Copilot prompt files
- `docs/ai/` for project context, architecture notes, standards, commands, portability rules, subagent roles, decisions, and future-work notes
- `docs/ai/tool-support-matrix.md` for necessary vs optional file guidance
- `scripts/check.ps1` and `scripts/check.sh` for stack-aware validation
- `scripts/bootstrap.ps1` and `scripts/bootstrap.sh` for first-time setup guidance

## Suggested workflow

1. For behavior, architecture, workflow, or multi-step work, create or update a spec in `docs/specs/`.
2. Create or update the matching implementation plan in `docs/plans/`, using markdown checklists for step tracking.
3. Create or update a task brief in `docs/ai/tasks/` for every non-trivial change, and keep its progress checklist current while work is in flight.
4. Fill in the files under `docs/ai/` with real project context as the product takes shape.
5. Keep `AGENTS.md` short and use it as a map to deeper docs.
6. Use `docs/ai/subagents/` when splitting work across planner, implementer, reviewer, and tester roles.
7. Run the check script before opening a PR or handing work to another tool or agent.

## Repository layout

```text
.
|-- .agent/
|   |-- rules/
|   |   `-- repository-playbook.md
|   `-- workflows/
|       |-- delegate-task.md
|       |-- implement-task.md
|       |-- plan-task.md
|       |-- review-change.md
|       `-- test-change.md
|-- .claude/
|   `-- rules/
|       |-- docs.md
|       |-- scripts.md
|       `-- subagents.md
|-- .github/
|   |-- copilot-instructions.md
|   |-- instructions/
|   |   |-- docs.instructions.md
|   |   |-- scripts.instructions.md
|   |   `-- subagents.instructions.md
|   `-- prompts/
|       |-- Delegate Task.prompt.md
|       |-- Implement Task.prompt.md
|       |-- Plan Task.prompt.md
|       |-- Review Change.prompt.md
|       `-- Test Change.prompt.md
|-- apps/
|   |-- README.md
|   |-- api/
|   |   `-- README.md
|   `-- web/
|       `-- README.md
|-- docs/
|   |-- plans/
|   |-- specs/
|   `-- ai/
|       |-- architecture.md
|       |-- commands.md
|       |-- decisions.md
|       |-- project-context.md
|       |-- portability.md
|       |-- standards.md
|       |-- subagents/
|       |   |-- README.md
|       |   |-- handoff-contract.md
|       |   |-- implementer.md
|       |   |-- planner.md
|       |   |-- reviewer.md
|       |   `-- tester.md
|       |-- tool-support-matrix.md
|       `-- tasks/
|           |-- README.md
|           `-- TEMPLATE.md
|-- package.json
|-- packages/
|   |-- README.md
|   |-- config-eslint/
|   |   `-- README.md
|   |-- config-typescript/
|   |   `-- README.md
|   |-- ui/
|   |   `-- README.md
|   `-- utils/
|       `-- README.md
|-- pnpm-workspace.yaml
|-- scripts/
|   |-- bootstrap.ps1
|   |-- bootstrap.sh
|   |-- check.ps1
|   `-- check.sh
|-- .editorconfig
|-- .gitignore
|-- AGENTS.md
|-- CLAUDE.md
|-- GEMINI.md
`-- README.md
```

## Quick start

This starter does not require Corepack. If `pnpm` is not installed globally, run `pnpm` through `npm exec --yes -- pnpm ...` instead. In PowerShell, use `npm.cmd` to avoid execution-policy issues with `npm.ps1`.

### PowerShell

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

### Bash

```bash
npm exec --yes -- pnpm install
./scripts/bootstrap.sh
./scripts/check.sh
```

## How the multi-agent setup works

### Shared instructions

`AGENTS.md` is the main file. Keep it short and use it as a map into `docs/ai/`.

The lean default is:

- always read `docs/ai/commands.md` and `docs/ai/standards.md`
- read `project-context.md` or `architecture.md` only when the task needs them
- read the current files in `docs/specs/`, `docs/plans/`, and `docs/ai/tasks/` when resuming in-flight work
- read `docs/ai/subagents/` only when the task benefits from role splitting

The portability default is:

- keep `AGENTS.md` canonical
- keep root tool files as thin adapters
- keep vendor-specific prompts and workflows optional

### Shared subagent system

`docs/ai/subagents/` defines planner, implementer, reviewer, and tester roles plus a handoff contract for multi-agent work. `docs/specs/`, `docs/plans/`, and `docs/ai/tasks/` preserve approved intent, execution steps, and live task state across tool switches.

### Claude Code

`CLAUDE.md` imports shared files with Claude's `@path` syntax. Use `.claude/rules/` for path-specific Claude behavior without bloating the root instruction file.

### Gemini

`GEMINI.md` is a thin root adapter for Gemini-compatible tools. It mirrors only the essential repository guidance so it stays portable and low-maintenance.

### GitHub Copilot

`.github/copilot-instructions.md` gives repo-wide guidance. `.github/instructions/` adds path-specific behavior, and `.github/prompts/` stores reusable prompt files for repeatable tasks.

### Antigravity

Antigravity workspace rules and workflows live in `.agent/`.

### pnpm workspace

The default JS or TS workspace layout is:

- apps in `apps/`
- shared packages in `packages/`
- root coordination in `package.json` and `pnpm-workspace.yaml`

Suggested starter folders:

- `apps/web`
- `apps/api`
- `packages/ui`
- `packages/utils`
- `packages/config-eslint`
- `packages/config-typescript`

### Codex and other agents

Use `AGENTS.md` as the default repository brief. If a tool does not automatically ingest repo instructions, point it at that file first.

## What this implements

- a shared instruction system
- committed workflow artifacts for cross-tool continuity
- thin root adapters for tool portability
- path-specific guidance for Claude Code and Copilot
- reusable prompts and workflows
- a subagent operating model with role boundaries and handoff rules
- a lean-context default with necessary versus optional files documented in `docs/ai/tool-support-matrix.md`

## What remains tool-driven

- the actual spawning of subagents still depends on the tool you use
- parallel execution still depends on the agent client or IDE
- repo-specific build, test, and lint commands should be refined once a real stack is added

## Current gaps

Known repo gaps and deferred improvements live in `docs/ai/future-work.md` so future sessions can pick them up without relying on chat history.

## Next steps

- add your application stack
- wire real lint, test, and build commands into the repo
- replace starter commands in `docs/ai/commands.md` with real project commands
- update `docs/ai/project-context.md` with product goals
- update `docs/ai/architecture.md` once the codebase shape is real
- refine `docs/ai/subagents/` once your stack and team workflow are real
- add real apps and packages under `apps/` and `packages/`
