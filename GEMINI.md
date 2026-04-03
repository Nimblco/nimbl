# Gemini Project Instructions

Use `AGENTS.md` as the canonical repository playbook.

Before starting work, check for active tasks with `pnpm workflow status` or by inspecting `docs/ai/tasks/` to avoid duplicating effort.

Always use:

- `docs/ai/commands.md` for build, test, and validation commands
- `docs/ai/standards.md` for repository-wide engineering rules

Read these only when relevant:

- `docs/ai/project-context.md`
- `docs/ai/architecture.md`
- `docs/specs/`
- `docs/plans/`
- `docs/ai/tasks/`
- `docs/ai/decisions.md`
- `docs/ai/subagents/README.md` when splitting work across roles
- `skills/` for agentskills.io-compatible skill definitions

Workflow requirements:

- run `pnpm workflow doctor` before starting any task to verify the workflow layer is ready
- create or update a task brief in `docs/ai/tasks/` for every non-trivial change
- create or update matching specs and plans before implementation when work changes behavior, architecture, workflow, or spans multiple steps
- append an ADR to `docs/ai/decisions.md` when introducing a new framework, dependency, or design pattern
- run `pnpm workflow check` to validate; use `pnpm workflow pack [--compress] [--to <tool>]` for handoffs; consult `docs/ai/commands.md` for the full CLI reference including `skill add`

Keep changes small, avoid overwriting user edits without approval, and report validation results clearly.
