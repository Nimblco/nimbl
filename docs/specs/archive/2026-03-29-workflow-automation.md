# Spec: workflow automation

## Purpose

Make the repository workflow mechanically executable by adding CLI scaffolding for aligned artifacts and by tightening workflow validation around the task brief as the source of truth.

## Scope

- in scope: non-interactive workflow scaffolding; stronger workflow checks; workflow documentation updates; a durable repo decision about non-interactive defaults
- out of scope: interactive planning wizards; automatic handoff-contract generation; automatic artifact content inference from arbitrary user requests

## Proposed behavior

The `workflow` CLI should gain a scaffold command that creates a task brief file under `docs/ai/tasks/` and, when requested, matching files under `docs/specs/` and `docs/plans/`. The scaffold command should use one aligned date-and-topic slug across all generated artifacts and should write linked paths directly into the task brief so subsequent commands can operate without guesswork.

The scaffold flow should be non-interactive-first. Callers should be able to specify the slug and artifact mode directly from the command line. The default generated content should follow the repo templates closely enough that another agent can resume from the repo alone after the files are filled in.

`workflow check` should continue validating linked paths, but it should also catch missing required task-brief fields and inconsistent artifact bundles. At minimum, it should require `status` and `next action`, treat explicit `none` values as intentionally omitted links, and fail when a linked plan exists without a linked spec. It should also recognize that some work is task-brief-only while other work is a full workflow bundle.

The documented happy path should become: scaffold the artifacts, edit them as the task becomes clearer, run `workflow check`, then use the existing handoff or finalize commands.

## Acceptance criteria

- [ ] `workflow scaffold --slug workflow-automation --artifacts bundle` creates aligned task, spec, and plan files for the current date and reports their paths
- [ ] `workflow scaffold --slug docs-tweak --artifacts task` creates only a task brief and writes `spec: none` and `plan: none`
- [ ] `workflow check` fails when required task-brief fields are missing
- [ ] `workflow check` fails when a task brief links a plan without a spec
- [ ] docs and subagent guidance describe scaffold -> check as the default workflow entrypoint

## Constraints

- technical: extend the existing `scripts/workflow-lib.mjs` command surface instead of introducing a second CLI
- product: preserve the current task/spec/plan mental model and archive behavior
- delivery: keep old task briefs valid when they intentionally omit linked artifacts through explicit `none`

## Risks and open questions

- risk 1: if scaffold content diverges from repo templates, the workflow may become harder to maintain over time
- risk 2: stricter validation may surface template drift in future docs unless command examples stay current
- question 1: whether handoff-contract enforcement belongs in this first automation pass; current answer is no

## Related docs

- plan: [2026-03-29-workflow-automation.md](../plans/2026-03-29-workflow-automation.md)
- task brief: [2026-03-29-workflow-automation.md](../ai/tasks/2026-03-29-workflow-automation.md)
- product doc: none
