# Antigravity Workspace Rule

Use `AGENTS.md` as the main repository playbook for this workspace.

Always read:

- `AGENTS.md`

Read additional files only when relevant:

- read `docs/ai/project-context.md`
- read `docs/ai/architecture.md`
- read `docs/specs/`, `docs/plans/`, and `docs/ai/tasks/` for in-flight work
- read `docs/ai/standards.md`
- read `docs/ai/subagents/README.md` when coordinating multiple agents
- read `docs/ai/decisions.md`

Working expectations:

- prefer small, reviewable changes
- avoid overwriting user changes without approval
- create or update a task brief for every non-trivial change
- create or update matching specs and plans before implementation for behavior, architecture, workflow, or multi-step work
- keep code and docs aligned
- update `docs/ai/decisions.md` when an important technical decision is made
- run `./scripts/check.ps1` or `./scripts/check.sh` when possible before finishing

If this rule and `AGENTS.md` ever differ, treat `AGENTS.md` as the source of truth and update this rule to match.
