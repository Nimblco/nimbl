# Plans

Use this folder for approved implementation plans.

A plan defines **how** the work will be implemented — the step-by-step approach, file changes, migration strategy, and validation steps.

Create or update a plan when work changes behavior, architecture, workflow, or spans multiple steps.

## Suggested filename format

- `YYYY-MM-DD-short-topic.md`

## Relationship to other artifacts

- A plan is linked from the task brief in `docs/ai/tasks/`.
- A matching spec in `docs/specs/` describes **what** the plan implements.
- Keep spec, plan, and task brief filenames aligned around the same date and topic when practical.

## Lifecycle

- Active plans live in this directory.
- Completed plans are moved to `archive/` by `pnpm workflow finalize` or `pnpm workflow archive`.

See `TEMPLATE.md` for the starter template.
