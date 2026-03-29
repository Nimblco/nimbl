# Task Briefs

Use this folder for committed task briefs and live execution state.

A task brief is required for every non-trivial change. It is the repo's working-state artifact and should stay current while work is in flight.

When the task changes behavior, architecture, workflow, or spans multiple steps:

- create or update the matching spec in `docs/specs/`
- create or update the matching plan in `docs/plans/`
- link both from the task brief

A task brief should usually include:

- the goal
- links to the matching spec and plan when they exist
- the relevant files or systems
- constraints
- current status, next action, and blockers
- a short progress checklist when the work spans multiple steps or handoffs
- validation steps
- any follow-up work

Keep task briefs short and current. Do not rely on chat history alone for state. If the task is still active, the brief should be enough for another tool to pick up the work.

Suggested filename format:

- `YYYY-MM-DD-short-task-name.md`

When using subagents:

- the planner should create or update the task brief first
- the task brief should identify file ownership for each agent
- reviewer and tester should reference the same brief and the same linked spec or plan so everyone evaluates the same scope
