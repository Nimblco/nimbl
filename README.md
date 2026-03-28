# AI Coding Boilerplate

A lightweight starter for repositories that should work well with Codex, Claude Code, GitHub Copilot, Gemini, Antigravity, and similar tools.

## Core idea

- keep one shared source of truth for repo behavior
- keep the default context small
- make skills and active work portable across IDEs and models
- use tool-specific adapters only as thin pointers back to shared docs

## Quick start

Install `pnpm` globally first if it is not already available:

```bash
npm install -g pnpm
```

If you just installed `pnpm`, restart your terminal before using the commands below.

### PowerShell

```powershell
pnpm install
./scripts/bootstrap.ps1
./scripts/check.ps1
```

If PowerShell blocks direct script execution:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1
```

### Bash

```bash
pnpm install
./scripts/bootstrap.sh
./scripts/check.sh
```

## Agent setup

The shared repo brain lives in:

- `AGENTS.md`
- `docs/ai/commands.md`
- `docs/ai/standards.md`
- `docs/ai/current-task.md`
- `docs/ai/skills/`

Use this loading pattern:

1. read `AGENTS.md`
2. always load `docs/ai/commands.md` and `docs/ai/standards.md`
3. load `docs/ai/current-task.md` only when it contains active work
4. load `docs/ai/skills/index.md` before substantial changes, then load only the matching skill
5. load `project-context.md`, `architecture.md`, `decisions.md`, or subagent docs only when needed

## Skills

Repo-owned skills live in `docs/ai/skills/` and are shared across tools.

Create a new skill:

```bash
pnpm run new skill my-skill
```

Preview without writing files:

```bash
pnpm run new skill my-skill --dry-run
```

Prompt for the name:

```bash
pnpm run new skill
```

After scaffolding a skill:

- replace the placeholder workflow, guardrails, and validation text
- update trigger keywords and file globs so the skill is discoverable
- keep shared rules in `AGENTS.md`, `docs/ai/commands.md`, and `docs/ai/standards.md` instead of duplicating them

## Optional layers

This repo keeps the default surface area small.

- `docs/ai/subagents/` and `docs/ai/tasks/` are optional and only useful when a task benefits from explicit role splitting
- `.github/instructions/` is optional when Copilot needs path-specific help
- `.claude/rules/` is optional when Claude needs path-specific help

Unused prompt and workflow wrappers were intentionally trimmed to keep the repo leaner.

## Repository shape

```text
.
|-- AGENTS.md
|-- CLAUDE.md
|-- GEMINI.md
|-- README.md
|-- package.json
|-- pnpm-workspace.yaml
|-- apps/
|-- packages/
|-- scripts/
|-- .agent/rules/
|-- .claude/rules/
|-- .github/copilot-instructions.md
|-- .github/instructions/
`-- docs/ai/
    |-- commands.md
    |-- standards.md
    |-- current-task.md
    |-- project-context.md
    |-- architecture.md
    |-- portability.md
    |-- decisions.md
    |-- tool-support-matrix.md
    |-- skills/
    |-- subagents/
    `-- tasks/
```

## Next steps

- add your application stack under `apps/` and `packages/`
- replace starter commands in `docs/ai/commands.md` with real project commands
- fill in `docs/ai/project-context.md` and `docs/ai/architecture.md`
- add or refine repo-owned skills in `docs/ai/skills/` as recurring workflows emerge
- use `docs/ai/subagents/` only when explicit role splitting actually helps
