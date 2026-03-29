# Quickstart

Use this page as the shortest path from an idea to a finished workflow bundle.

Once Nimblco is installed in your repo, start with `pnpm workflow scaffold` when you need a new task brief, spec, or plan. The templates in `docs/specs/TEMPLATE.md`, `docs/plans/TEMPLATE.md`, and `docs/ai/tasks/TEMPLATE.md` define the structure the scaffold mirrors.

## 1. Create the artifacts

1. Run `pnpm workflow scaffold --slug <topic> --artifacts bundle` when the work changes behavior, architecture, workflow, or spans multiple steps.
2. Run `pnpm workflow scaffold --slug <topic> --artifacts task` when the work only needs a task brief.
3. Fill in the generated files so the current work has a real summary, scope, next action, and validation notes.

## 2. Keep them aligned

- The spec says what should change and why.
- The plan says how the work will be carried out.
- The task brief says what is happening now and what another agent needs to know to continue.
- Use explicit `none` values for intentionally omitted spec or plan links so later tools do not have to infer intent.

If the scope changes, update all three artifacts together so the bundle stays easy to resume.

## 3. Validate the work

Run `pnpm workflow check` before handoff so missing fields or broken linked paths fail early. Then use the commands listed in `docs/ai/commands.md` for code validation. Start with the smallest useful check, then run the stronger repo checks before handoff.

Typical flow:

- run `pnpm workflow check`
- run focused tests or checks for the files you changed
- run the repository validation command set
- fix any failures before marking the task ready

## 4. Export for another tool when needed

When another LLM or IDE needs to continue the work, generate a portable markdown handoff pack:

- run `pnpm workflow pack`
- add `--to gemini` or `--to claude` for a tool-specific prompt block
- add `--stdout` when you want to paste the pack directly without writing a file
- add `--include-diff` only when the receiving tool really needs patch-level context

The default pack path is `docs/ai/handoffs/`.

## 5. Finalize the bundle

When the work is complete:

1. Make sure the task brief is marked complete and the final status is accurate.
2. Confirm the linked spec and plan reflect the final outcome.
3. Run `pnpm workflow finalize --task <path-to-completed-task-brief>` or the matching fallback command from `docs/ai/commands.md` when more than one task brief exists.

## Rule of thumb

If another agent should be able to resume the work from the repo alone, the spec, plan, and task brief are probably complete enough.
