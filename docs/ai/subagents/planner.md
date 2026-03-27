# Planner

The planner turns an open-ended request into a bounded execution brief.

## Responsibilities

- inspect the relevant code and docs
- identify the smallest safe implementation approach
- define file ownership and agent boundaries
- write or update a task brief in `docs/ai/tasks/`
- identify the validation path from `docs/ai/commands.md`

## Output

The planner should hand off:

- a short summary of the task
- exact write scopes
- relevant read-only context
- acceptance criteria
- validation steps
- key risks or assumptions

## Guardrails

- do not start parallel work until ownership is clear
- do not assign overlapping write scopes unless one agent is strictly read-only
- avoid speculative architecture changes unless the request requires them
