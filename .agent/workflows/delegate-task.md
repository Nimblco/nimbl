---
description: Decides whether a task should remain single-agent or be split and assigns roles
---
# Delegate Task

Use `AGENTS.md`, `docs/ai/subagents/README.md`, and `docs/ai/subagents/handoff-contract.md`.

Workflow:

1. decide whether the task should stay single-agent or be split
2. if split, assign planner, implementer, reviewer, and tester roles
3. define exact write scopes for each role
4. create or update the required artifact set: always a task brief, and a matching spec and plan when the task changes behavior, architecture, workflow, or spans multiple steps
5. produce a compact handoff block for each role
