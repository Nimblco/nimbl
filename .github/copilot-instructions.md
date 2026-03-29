# GitHub Copilot Instructions

Use `AGENTS.md` as the main project playbook.

Always read:

- `AGENTS.md`

Read additional files only when relevant:

- `docs/ai/project-context.md`
- `docs/ai/architecture.md`
- `docs/specs/`
- `docs/plans/`
- `docs/ai/tasks/`
- `docs/ai/subagents/README.md`
- `docs/ai/decisions.md`

When generating code:

- prefer clear and maintainable solutions
- avoid changing unrelated files
- create or update a task brief for every non-trivial change
- create or update matching specs and plans before implementation for behavior, architecture, workflow, or multi-step work
- suggest tests when behavior changes
- keep documentation aligned with code changes

Before finalizing implementation, prefer running the repository validation commands:

- `./scripts/check.ps1`
- `./scripts/check.sh`

Use `.github/instructions/` for path-specific guidance and `.github/prompts/` for reusable task prompts.
