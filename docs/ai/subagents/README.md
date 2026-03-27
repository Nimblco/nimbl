# Subagent System

This repository defines a shared subagent operating model so different AI tools can split work consistently.

## Roles

- `planner.md`: turns a request into a bounded task brief
- `implementer.md`: makes the code or docs change within an assigned scope
- `reviewer.md`: looks for bugs, regressions, and weak validation
- `tester.md`: verifies behavior and reports confidence gaps

## Default sequence

1. Planner creates or updates a task brief using `docs/ai/tasks/TEMPLATE.md`.
2. Implementer changes only the files in its assigned write scope.
3. Reviewer checks the diff with a bug-finding mindset.
4. Tester runs the best available validation and reports results.

## Parallel work rules

- parallelize only when write scopes are disjoint
- if one role depends on another role's output, keep that step on the critical path
- planner should assign ownership before implementation begins
- reviewer and tester should avoid making broad code changes unless explicitly asked

## Shared contract

Use `handoff-contract.md` for all role-to-role handoffs so context stays compact and predictable across tools.
