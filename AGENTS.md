# Agent Index

This file is the shared entrypoint for coding agents in this repository.

## Always read

- `docs/ai/commands.md`
- `docs/ai/standards.md`

## Read when relevant

- `docs/ai/project-context.md` for product or business context
- `docs/ai/architecture.md` for system shape and module boundaries
- `docs/ai/subagents/README.md` when splitting work across roles
- `docs/ai/decisions.md`

## Core workflow

1. Inspect the current code and docs before editing.
2. Make the smallest change that solves the task clearly.
3. Update docs when behavior, architecture, or workflow changes.
4. Run the best available validation command from `docs/ai/commands.md`.
5. Call out assumptions, blockers, and follow-up risks explicitly.

## Rules

- do not overwrite user changes without approval
- prefer clarity over cleverness
- add or update tests when behavior changes
- keep commands reproducible and easy to run locally
- record meaningful tradeoffs in `docs/ai/decisions.md`

## Subagent model

- use the role definitions in `docs/ai/subagents/` only when the task benefits from role splitting
- split work by responsibility and file ownership
- planner produces the brief before parallel work starts
- implementer changes code, reviewer checks risk, tester verifies behavior
- if multiple agents work in parallel, give each a disjoint write scope
- use `docs/ai/subagents/handoff-contract.md` for task handoffs

## Tool-specific adapters

- Claude Code: `CLAUDE.md`
- Gemini CLI and Gemini-compatible tools: `GEMINI.md`
- GitHub Copilot: `.github/copilot-instructions.md`, `.github/instructions/`, `.github/prompts/`
- Antigravity: `.agent/`

If a tool-specific file conflicts with this file, update the adapter so the shared guidance stays aligned here.
