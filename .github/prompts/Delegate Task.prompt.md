---
description: Decides whether a task should remain single-agent or be split and assigns roles
---
# Delegate Task

Use [AGENTS.md](../../AGENTS.md), [Subagent System](../../docs/ai/subagents/README.md), and [Handoff Contract](../../docs/ai/subagents/handoff-contract.md).

For the current task:

1. decide whether the work should stay single-agent or split across roles
2. if split, assign planner, implementer, reviewer, and tester responsibilities
3. define exact write scopes for each role
4. create or update the required artifact set: always a task brief, and a matching spec and plan when the task changes behavior, architecture, workflow, or spans multiple steps
5. return concise handoff blocks for each assigned role
