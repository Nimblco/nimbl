# Engineering Standards

These rules apply across the repository unless a more specific file says otherwise.

## Change style

- prefer small, reviewable changes over broad rewrites
- optimize for clarity over cleverness
- favor explicit names and predictable structure
- avoid unnecessary dependencies
- leave short comments only where intent is not obvious

## Safety

- do not overwrite user changes without approval
- avoid unrelated edits while solving the current task
- call out assumptions when repository context is incomplete
- document follow-up risks when the change is incomplete or constrained

## Quality

- add or update tests when behavior changes
- keep documentation aligned with architecture or workflow changes
- record meaningful technical tradeoffs in `docs/ai/decisions.md`
- prefer reproducible commands that work for a teammate on a fresh machine

## Workflow artifacts

- create or update a task brief in `docs/ai/tasks/` for every non-trivial change
- create or update matching files in `docs/specs/` and `docs/plans/` before implementation when the work changes behavior, architecture, workflow, or spans multiple steps
- keep linked artifacts aligned around the same date and topic when practical
- use markdown checklists (`- [ ]` and `- [x]`) in multi-step plans and in task briefs when progress tracking will help another tool resume work quickly
- keep the task brief current with status, next action, and blockers so another tool can resume work from the repo alone
- tiny wording-only edits may skip artifacts when continuity would not meaningfully benefit

## Definition of done

- code changes are complete
- required task briefs, specs, and plans were created or updated
- docs were updated when needed
- validation was run, or the blocker was explained
- remaining risks or next steps were called out
