# Agent Index

This file is the shared entrypoint for coding agents in this repository.

## Always read

- `docs/ai/commands.md`
- `docs/ai/standards.md`

## Read when relevant

- `docs/ai/project-context.md` for product or business context
- `docs/ai/architecture.md` for system shape and module boundaries
- `docs/ai/future-work.md` for known gaps and deferred repo or product improvements
- `docs/specs/` for approved behavior, architecture, or workflow specs
- `docs/plans/` for approved implementation plans
- `docs/ai/tasks/` for the current task brief and in-flight execution state
- `docs/ai/subagents/README.md` when splitting work across roles
- `docs/ai/decisions.md`

## Core workflow

1. Inspect the current code and docs before editing.
2. Create or update a task brief in `docs/ai/tasks/` for every non-trivial change.
3. Create or update a matching spec in `docs/specs/` and plan in `docs/plans/` before implementation when work changes behavior, architecture, workflow, or spans multiple steps.
4. Make the smallest change that solves the task clearly.
5. Update docs when behavior, architecture, or workflow changes.
6. Run the best available validation command from `docs/ai/commands.md`.
7. Call out assumptions, blockers, and follow-up risks explicitly.

## Rules

- do not overwrite user changes without approval
- prefer clarity over cleverness
- add or update tests when behavior changes
- keep the task brief current so another tool or agent can resume work without hidden context
- for behavior, architecture, workflow, or multi-step work, keep spec, plan, and task brief filenames aligned around the same date and topic when practical
- use markdown checklists for multi-step plans and for in-flight task tracking when progress needs to be resumed by another tool or agent
- keep commands reproducible and easy to run locally
- record meaningful tradeoffs in `docs/ai/decisions.md`

## Subagent model

- use the role definitions in `docs/ai/subagents/` only when the task benefits from role splitting
- split work by responsibility and file ownership
- planner produces the required artifacts before parallel work starts
- implementer, reviewer, and tester reference the same brief and linked spec or plan
- if multiple agents work in parallel, give each a disjoint write scope
- use `docs/ai/subagents/handoff-contract.md` for task handoffs

## Tool-specific adapters

- Claude Code: `CLAUDE.md`
- Gemini CLI and Gemini-compatible tools: `GEMINI.md`
- GitHub Copilot: `.github/copilot-instructions.md`, `.github/instructions/`, `.github/prompts/`
- Antigravity: `.agent/`

If a tool-specific file conflicts with this file, update the adapter so the shared guidance stays aligned here.
