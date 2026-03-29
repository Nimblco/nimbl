@AGENTS.md

# Claude Code Notes

Always read `AGENTS.md` first — it is the canonical workflow playbook.

Before starting work, check for active tasks with `pnpm workflow status` or by inspecting `docs/ai/tasks/` to avoid duplicating effort.

- Create or update a task brief in `docs/ai/tasks/` for every non-trivial change.
- Create or update matching specs and plans before implementation when work changes behavior, architecture, workflow, or spans multiple steps.
- Append an ADR to `docs/ai/decisions.md` when introducing a new framework, dependency, or design pattern.
- Use `docs/ai/subagents/` when splitting work across planner, implementer, reviewer, and tester roles.
- Run validation from `docs/ai/commands.md` before marking work done.
- Prefer adding path-specific guidance in `.claude/rules/` instead of growing this file.
