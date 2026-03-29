# Engineering Decisions

Track meaningful technical decisions here.

### Committed workflow artifacts for tool switching

- date: 2026-03-29
- status: accepted
- context: This repository is meant to support agentic coding across multiple tools. Chat history and tool-local state are too fragile to preserve active work when switching IDEs or LLMs.
- decision: Use committed markdown artifacts as the continuity layer. Every non-trivial change requires a task brief in `docs/ai/tasks/`. Behavior, architecture, workflow, or multi-step work also requires a spec in `docs/specs/` and a plan in `docs/plans/` before implementation begins.
- consequences: Agents can resume in-flight work from the repo itself instead of hidden session memory. The workflow adds some overhead to larger tasks, but it creates a much stronger handoff surface across tools and sessions.

### pnpm without Corepack

- date: 2026-03-29
- status: accepted
- context: This starter uses a `pnpm` workspace, but relying on Corepack adds an extra prerequisite and behaves inconsistently across tools and locked-down environments.
- decision: Use `pnpm` as the workspace package manager without requiring Corepack. Documentation should prefer direct `pnpm` usage when available and allow `npm exec --yes -- pnpm ...` as the fallback path. Repository check scripts should use the fallback automatically when `pnpm` is not globally installed, and they should keep npm cache writes inside the repo when possible.
- consequences: Setup becomes easier on machines that already have Node and npm, and agent tooling can stay aligned around one package manager. The fallback path may be slower on first use because it can fetch `pnpm`, but it avoids making Corepack a mandatory dependency.

## Template

### Decision title

- date:
- status:
- context:
- decision:
- consequences:

---

Add new decisions to the top once the project is active.
