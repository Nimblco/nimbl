# Future Work

Use this file for known gaps, deferred improvements, and follow-up work that is intentionally not part of the current task.

Keep entries short, actionable, and grouped by theme. This file should stay useful for both starter-maintenance work and downstream product follow-up work.

## Workflow starter

- [ ] Add a GitHub Actions CI workflow that runs `pnpm run test` on push and pull request
- [ ] Add a `--dry-run` flag to `workflow scaffold` so agents can preview artifact paths before creating files
- [ ] Add `workflow rename` or `workflow retitle` to support slug corrections after scaffolding

## Repo infrastructure

- [ ] Add a GitHub Actions CI workflow that runs `pnpm run test` on push and pull request
- [ ] Set up npm publish automation (release tag triggers `npm publish`)

## Developer experience

- [ ] Add a `workflow doctor` command that checks for required tools (`node`, `pnpm`, `git`) and validates the repo shape before first use
- [ ] Explore clipboard fallback detection on Linux during `init-workflow` so users are warned early if no clipboard tool is available

## Operations

- [ ] Document a recommended archive rotation policy for `docs/ai/tasks/archive/` when it accumulates many completed briefs

## Usage notes

- Review this file when planning starter improvements, repo improvements, or product scaffolding.
- Prefer moving active work into a spec, plan, and task brief when it becomes implementation work.
- Do not treat this file as a substitute for the required task artifacts during implementation.
- Remove completed items instead of leaving stale history behind.
