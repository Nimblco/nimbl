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
- read `skills/` for agentskills.io-compatible skill definitions

Workflow CLI:

Run `pnpm workflow doctor` before starting any task to verify the workflow layer is installed. Key commands:

- `pnpm workflow scaffold --slug <topic>` — create a dated task brief, spec, and plan
- `pnpm workflow check` — validate the active task brief
- `pnpm workflow pack [--compress] [--to <tool>]` — write a handoff pack to `docs/ai/handoffs/`
- `pnpm workflow finalize` — archive completed task and linked artifacts
- `pnpm workflow skill add <repo>` — install agentskills.io skills from a remote repo

Working expectations:

- prefer small, reviewable changes
- avoid overwriting user changes without approval
- create or update a task brief for every non-trivial change
- create or update matching specs and plans before implementation for behavior, architecture, workflow, or multi-step work
- keep code and docs aligned
- update `docs/ai/decisions.md` when an important technical decision is made
- run `pnpm workflow doctor && pnpm workflow check` before finishing

If this rule and `AGENTS.md` ever differ, treat `AGENTS.md` as the source of truth and update this rule to match.
