# Future Work

Use this file to record known gaps, deferred improvements, and setup work that should be revisited in future sessions.

Keep entries short, actionable, and grouped by theme. When an item is completed, update or remove it instead of leaving stale backlog notes behind.

## Workflow enforcement

- [ ] Add hard enforcement for required workflow artifacts through CI, hooks, or validation scripts.
- [ ] Add lifecycle rules for specs, plans, and task briefs, including when to mark them active, completed, or archived.
- [ ] Add PR workflow linkage so reviews or pull requests reference the matching spec, plan, and task brief.

## Product bootstrap

- [ ] Replace starter commands in `docs/ai/commands.md` and the check scripts with real project commands once the first product apps or packages exist.
- [ ] Fill in `docs/ai/project-context.md` with real product goals, users, and constraints once product definition starts.
- [ ] Fill in `docs/ai/architecture.md` with real modules, flows, and conventions once codebase structure becomes real.
- [ ] Replace placeholder apps and packages with real product code.

## Monorepo evolution

- [ ] Re-evaluate whether to add Nx once the monorepo has multiple real apps or packages and would benefit from unified task orchestration, caching, or affected runs.

## Usage notes

- Review this file when planning repo improvements or starting product scaffolding.
- Prefer moving accepted work into a spec, plan, and task brief when it becomes active work.
- Do not treat this file as a substitute for the required task artifacts during implementation.
