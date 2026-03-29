# Product Docs

Use this folder for product-owned documentation that explains the real thing this repo is building.

If you are starting a new artifact, use `docs/product/prd/TEMPLATE.md` for PRDs and the workflow templates in `docs/specs/TEMPLATE.md` and `docs/plans/TEMPLATE.md` for execution docs.

## What belongs here

- PRDs for product-level initiatives
- product research or decision notes that are broader than one implementation task
- durable product references that are not just workflow metadata

## How PRDs differ

- `docs/ai/project-context.md` captures stable repo-wide product facts that every agent should know.
- `docs/product/prd/` captures initiative-level product intent: the problem, audience, outcome, and success measures.
- `docs/specs/` captures approved behavior or architecture for a specific change.
- `docs/plans/` captures the implementation steps for that spec.
- `docs/ai/tasks/` captures the current execution state, handoff notes, and validation status.

## Practical guidance

- Keep PRDs focused on product decisions, not implementation detail.
- Keep project context durable and broad, not tied to a single initiative.
- Keep specs, plans, and task briefs narrow enough that another agent can resume work without extra context.

If a document starts describing how code will be built, it probably belongs in a spec or plan instead of a PRD.
