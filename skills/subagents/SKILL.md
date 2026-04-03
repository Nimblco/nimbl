---
name: subagents
description: Rules for coordinating multi-agent work in docs/ai/subagents/ and docs/ai/tasks/. Use when defining agent roles, task file ownership, or planning multi-agent delegation.
license: MIT
---

# Subagent Coordination Rules

- Keep role definitions explicit and non-overlapping.
- Prefer task briefs with exact write scopes over broad delegation.
- When multiple agents are involved, make file ownership clear before implementation starts.
- Use the role definitions in `docs/ai/subagents/` only when the task benefits from role splitting.
- Split work by responsibility and file ownership. Give each parallel agent a disjoint write scope.
- The planner produces all required artifacts (spec, plan, task brief) before parallel work starts.
- Use `docs/ai/subagents/handoff-contract.md` for task handoffs between agents.
