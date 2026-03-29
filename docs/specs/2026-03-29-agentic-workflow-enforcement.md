# Agentic Workflow Artifact Enforcement Spec

## Summary

This repository should preserve active work state in committed markdown artifacts instead of relying on tool-local memory or chat history. The workflow should stay lightweight for small edits but become explicit for real implementation work.

## Goals

- preserve continuity when switching IDEs, tools, or LLMs
- make planner, implementer, reviewer, and tester workflows read from the same committed context
- require enough structure for real product work without forcing heavyweight ceremony on tiny edits

## Non-goals

- automatic hook-based enforcement
- replacing shared docs with vendor-specific rule files
- defining product-specific build, test, or lint commands before the real apps exist

## Required artifacts

### Task brief

Every non-trivial change must have a task brief in `docs/ai/tasks/`. The brief is the live execution-state document and should contain:

- the task summary
- links to the matching spec and plan when they exist
- current status, owner, next action, and blockers
- a short progress checklist when the task spans multiple steps or handoffs
- acceptance criteria, validation steps, and handoff notes

### Spec

A spec in `docs/specs/` is required before implementation when the work changes:

- behavior
- architecture
- workflow
- or spans multiple steps that benefit from an approved design

The spec captures the why and what. It should be stable enough for another tool to understand the intended outcome without replaying chat history.

### Plan

A plan in `docs/plans/` is required whenever the matching spec is required. The plan captures the intended execution path, write scopes, validation path, and step ordering.

Plans should use markdown checklists so another tool or agent can see progress and remaining work without reconstructing the session from chat history.

## Artifact naming

When practical, related files should share the same `YYYY-MM-DD-topic` stem:

- `docs/specs/YYYY-MM-DD-topic.md`
- `docs/plans/YYYY-MM-DD-topic.md`
- `docs/ai/tasks/YYYY-MM-DD-topic.md`

## Role expectations

- planner decides which artifact set is required and creates or updates it before implementation starts
- implementer reads the task brief and any linked spec or plan before editing
- reviewer evaluates the diff against the same artifacts
- tester validates against the same artifacts and reports confidence gaps clearly

## Tool portability expectations

- `AGENTS.md`, `docs/ai/standards.md`, and other shared docs remain the source of truth
- tool-specific adapters stay thin and point back to the shared workflow
- artifact state must live in plain markdown checked into the repo so another tool can resume work
- known gaps and deferred setup work should be recorded in a shared markdown backlog instead of living only in chat history

## Exceptions

Tiny wording-only edits may skip artifacts when continuity would not meaningfully benefit.

## Acceptance criteria

- the repo contains committed `docs/specs/` and `docs/plans/` directories with this workflow's own artifacts
- the repo contains a shared future-work backlog for known gaps and deferred setup items
- shared docs require task briefs for non-trivial work
- shared docs require specs and plans for behavior, architecture, workflow, or multi-step work
- planner, implementer, reviewer, and tester guidance all reference the same artifact set
- Antigravity and Copilot adapters reflect the same policy without becoming separate rulebooks
