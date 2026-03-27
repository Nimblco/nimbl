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

## Definition of done

- code changes are complete
- docs were updated when needed
- validation was run, or the blocker was explained
- remaining risks or next steps were called out
