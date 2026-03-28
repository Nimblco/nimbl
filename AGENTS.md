# Agent Index

Use this file as the shared entrypoint for coding agents in this repository.

## Always read

- `docs/ai/commands.md`
- `docs/ai/standards.md`

## Load only when relevant

- `docs/ai/current-task.md` when it contains active work
- `docs/ai/skills/index.md` before substantial changes
- `docs/ai/project-context.md`
- `docs/ai/architecture.md`
- `docs/ai/subagents/README.md` when splitting work across roles
- `docs/ai/decisions.md`

## Core workflow

- inspect relevant code and docs before editing
- refresh `docs/ai/current-task.md` only for active in-progress work
- make the smallest clear change
- update docs when behavior or workflow changes
- run the best available validation command
- call out assumptions, blockers, and follow-up risks

## Rules

- do not overwrite user changes without approval
- avoid unrelated edits
- add or update tests when behavior changes
- record meaningful tradeoffs in `docs/ai/decisions.md`

## Subagent model

- use `docs/ai/subagents/` only when the task benefits from role splitting
- keep write scopes disjoint
- use `docs/ai/subagents/handoff-contract.md` for handoffs

## Context model

- keep durable repo context in shared docs
- keep active handoff state in `docs/ai/current-task.md`
- keep reusable skill logic in `docs/ai/skills/`
- keep adapters thin and aligned to this file

## Tool-specific adapters

- Claude Code: `CLAUDE.md`
- Gemini CLI and Gemini-compatible tools: `GEMINI.md`
- GitHub Copilot: `.github/copilot-instructions.md`, `.github/instructions/`
- Antigravity: `.agent/rules/`
