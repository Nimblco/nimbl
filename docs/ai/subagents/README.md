# Subagent System

This repository defines a shared subagent operating model so different AI tools can split work consistently.

## Roles

- `planner.md`: turns a request into a bounded task brief
- `implementer.md`: makes the code or docs change within an assigned scope
- `reviewer.md`: looks for bugs, regressions, and weak validation
- `tester.md`: verifies behavior and reports confidence gaps

## Default sequence

1. Planner creates or updates the task brief, preferably starting with `pnpm workflow scaffold --slug <topic> --artifacts task|bundle`.
2. If the task changes behavior, architecture, workflow, or spans multiple steps, the planner uses the bundle scaffold or creates the matching spec in `docs/specs/` and plan in `docs/plans/`.
3. Implementer reads the task brief and any linked spec or plan before changing files inside its assigned write scope.
4. Reviewer checks the diff against the same artifacts with a bug-finding mindset.
5. Tester runs the best available validation and reports results against the same scope.

## Parallel work rules

- parallelize only when write scopes are disjoint
- if one role depends on another role's output, keep that step on the critical path
- planner should assign ownership before implementation begins
- reviewer and tester should avoid making broad code changes unless explicitly asked

## Artifact rules

- every non-trivial change needs a task brief
- behavior, architecture, workflow, or multi-step work also needs a spec and plan
- prefer `pnpm workflow scaffold` so filenames and linked paths stay aligned by default
- keep filenames aligned around the same date and topic when practical
- use explicit `none` values when a spec or plan is intentionally omitted
- keep the task brief current so another tool can resume work without hidden context

## Shared contract

Use `handoff-contract.md` for all role-to-role handoffs so context stays compact and predictable across tools.
