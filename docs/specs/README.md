# Specs

Use this folder for approved behavior, architecture, or workflow specs.

A spec defines **what** the change should accomplish — scope, constraints, acceptance criteria, and any architectural decisions — before implementation begins.

Create or update a spec when work changes behavior, architecture, workflow, or spans multiple steps.

## Suggested filename format

- `YYYY-MM-DD-short-topic.md`

## Relationship to other artifacts

- A spec is linked from the task brief in `docs/ai/tasks/`.
- A matching plan in `docs/plans/` describes **how** the spec will be implemented.
- Keep spec, plan, and task brief filenames aligned around the same date and topic when practical.

## Lifecycle

- Active specs live in this directory.
- Completed specs are moved to `archive/` by `pnpm workflow finalize` or `pnpm workflow archive`.

See `TEMPLATE.md` for the workflow scaffold template.
