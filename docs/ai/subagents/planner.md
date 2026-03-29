# Planner

The planner turns an open-ended request into a bounded execution brief.

## Responsibilities

- inspect the relevant code and docs
- decide whether the task needs a task brief only or a task brief plus spec and plan
- identify the smallest safe implementation approach
- define file ownership and agent boundaries
- write or update the required artifacts in `docs/ai/tasks/`, `docs/specs/`, and `docs/plans/`
- add or update checklist items when the work has multiple steps or handoffs that should be resumable at a glance
- link the artifacts together so the next agent can recover the full context
- identify the validation path from `docs/ai/commands.md`

## Output

The planner should hand off:

- a short summary of the task
- artifact paths for the task brief and any linked spec or plan
- exact write scopes
- relevant read-only context
- acceptance criteria
- validation steps
- key risks or assumptions

## Guardrails

- do not start implementation until the required artifact set exists
- do not start parallel work until ownership is clear
- do not assign overlapping write scopes unless one agent is strictly read-only
- avoid speculative architecture changes unless the request requires them
