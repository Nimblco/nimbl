@AGENTS.md

# Claude Code Notes

- Use `docs/ai/tasks/` for task-specific execution state that should survive tool switching.
- Use `docs/specs/` and `docs/plans/` for approved specs and implementation plans on larger or workflow-changing tasks.
- Use `docs/ai/subagents/` when splitting work across planner, implementer, reviewer, and tester roles.
- Prefer adding path-specific guidance in `.claude/rules/` instead of growing this file.
