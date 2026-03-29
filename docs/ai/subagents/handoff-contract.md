# Handoff Contract

Every subagent handoff should include the following:

## Required fields

- role:
- goal:
- task brief:
- spec:
- plan:
- exact write scope:
- read-only context:
- constraints:
- validation expectation:
- output format:

## Example

```text
role: implementer
goal: add request timeout handling to the API client
task brief: docs/ai/tasks/2026-03-29-api-timeout.md
spec: docs/specs/2026-03-29-api-timeout.md
plan: docs/plans/2026-03-29-api-timeout.md
exact write scope: src/api/client.ts, tests/api/client.test.ts
read-only context: docs/ai/architecture.md, docs/ai/commands.md
constraints: do not change retry behavior; preserve public method signatures
validation expectation: run the API client test suite
output format: short summary, changed files, test result, remaining risks
```

## Rules

- write scope should be explicit and as small as possible
- if multiple subagents are active, their write scopes should not overlap
- include artifact paths even when one of them is intentionally omitted
- if you cannot honor the scope, stop and escalate instead of expanding it silently
