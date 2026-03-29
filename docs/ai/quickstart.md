# Quickstart

Use this page as the shortest path from an idea to a finished workflow bundle.

Start from the templates in `docs/specs/TEMPLATE.md`, `docs/plans/TEMPLATE.md`, and `docs/ai/tasks/` when you need a new spec, plan, or task brief.

## 1. Create the artifacts

1. Write a spec in `docs/specs/` when the work changes behavior, architecture, workflow, or spans multiple steps.
2. Write the matching plan in `docs/plans/` once the spec is clear enough to execute.
3. Create or update the task brief in `docs/ai/tasks/` so the current work has status, next action, and validation notes.

## 2. Keep them aligned

- The spec says what should change and why.
- The plan says how the work will be carried out.
- The task brief says what is happening now and what another agent needs to know to continue.

If the scope changes, update all three artifacts together so the bundle stays easy to resume.

## 3. Validate the work

Use the commands listed in `docs/ai/commands.md` for validation. Start with the smallest useful check, then run the stronger repo checks before handoff.

Typical flow:

- run focused tests or checks for the files you changed
- run the repository validation command set
- fix any failures before marking the task ready

## 4. Finalize the bundle

When the work is complete:

1. Make sure the task brief is marked complete and the final status is accurate.
2. Confirm the linked spec and plan reflect the final outcome.
3. Run `pnpm workflow finalize` or the matching fallback command from `docs/ai/commands.md`.

## Starter rule of thumb

If another agent should be able to resume the work from the repo alone, the spec, plan, and task brief are probably complete enough.
