# Task Brief

## Summary

- task: enforce committed task brief, spec, and plan artifacts for this repo's agentic workflow
- requested outcome: make cross-tool continuity a shared repo policy instead of a tool-specific habit
- primary constraint: keep the adapters thin and keep the workflow lightweight for tiny edits

## Linked artifacts

- spec: `docs/specs/2026-03-29-agentic-workflow-enforcement.md`
- plan: `docs/plans/2026-03-29-agentic-workflow-enforcement.md`

## Current state

- status: completed
- current owner: codex
- next action: review the policy wording and then apply the same workflow to upcoming product work
- blockers: none

## Progress checklist

- [x] create the initial spec, plan, and task brief artifacts
- [x] update shared policy docs to require committed workflow artifacts
- [x] align Antigravity and Copilot adapters with the same artifact rules
- [x] add checklist guidance to the continuity model
- [x] record known repo gaps in a shared future-work backlog
- [x] run validation and record the result

## Scope

- in scope: shared repo policy docs, subagent guidance, thin adapters, prompt workflows, and the initial workflow artifacts
- out of scope: product-specific app setup, real app build pipelines, automatic enforcement hooks

## File ownership

- planner: current session
- implementer: current session
- reviewer: current session
- tester: current session

## Relevant files

- `AGENTS.md`
- `README.md`
- `docs/ai/standards.md`
- `docs/ai/portability.md`
- `docs/ai/tool-support-matrix.md`
- `docs/ai/decisions.md`
- `docs/ai/future-work.md`
- `docs/ai/tasks/README.md`
- `docs/ai/tasks/TEMPLATE.md`
- `docs/ai/subagents/`
- `.agent/`
- `.github/`

## Acceptance criteria

- shared docs require a task brief for every non-trivial change
- shared docs require specs and plans for behavior, architecture, workflow, or multi-step work
- thin adapters remain aligned with the shared policy
- the repo contains committed example artifacts for this workflow change itself

## Validation

- `rg -n "docs/specs|docs/plans|docs/ai/tasks" AGENTS.md README.md docs .agent .github -g "*"`
- `powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1`

## Risks or dependencies

- risk 1: over-documenting small changes could slow down trivial work if the exception rule is unclear
- dependency 1: future product scaffolding should refine commands and app-specific workflows without weakening the shared artifact policy

## Handoff notes

- validation completed with `powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1`
- artifact search confirmed the new `docs/specs/`, `docs/plans/`, and `docs/ai/tasks/` workflow is referenced consistently across shared docs and thin adapters
- known gaps and deferred setup work now live in `docs/ai/future-work.md`
- if adapters drift from `AGENTS.md`, update the adapter instead of forking the rule
