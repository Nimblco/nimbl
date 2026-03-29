# Agentic Workflow Artifact Enforcement Implementation Plan

> **For agentic workers:** Use the shared planner, implementer, reviewer, and tester workflow. Keep the task brief, spec, and plan aligned while this work is in progress.

**Goal:** Require committed task briefs for non-trivial work and committed specs plus plans for behavior, architecture, workflow, or multi-step work.

**Architecture:** Keep the policy in shared repository docs, then mirror it in thin Antigravity and Copilot adapters. Use the workflow's own spec, plan, and task brief as the first example of the new continuity model.

**Tech Stack:** Markdown docs, repo instruction files, and existing validation scripts

---

### Task 1: Create the committed workflow artifacts

**Files:**
- Create: `docs/specs/2026-03-29-agentic-workflow-enforcement.md`
- Create: `docs/plans/2026-03-29-agentic-workflow-enforcement.md`
- Create: `docs/ai/tasks/2026-03-29-agentic-workflow-enforcement.md`

- [x] Write the workflow spec with goals, required artifacts, role expectations, and acceptance criteria.
- [x] Write the implementation plan that breaks the repo change into shared-doc, adapter, and validation tasks.
- [x] Write the task brief that links the spec and plan and records the current execution state.

### Task 2: Tighten the shared repository policy

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/ai/standards.md`
- Modify: `docs/ai/portability.md`
- Modify: `docs/ai/tool-support-matrix.md`
- Modify: `docs/ai/decisions.md`
- Modify: `README.md`

- [x] Update the core repo playbook so non-trivial work requires a task brief.
- [x] Require specs and plans before implementation for behavior, architecture, workflow, or multi-step work.
- [x] Document the portability rationale so task state lives in committed markdown instead of hidden tool memory.
- [x] Record the artifact decision in the engineering decisions log.

### Task 3: Update shared task and subagent documents

**Files:**
- Modify: `docs/ai/tasks/README.md`
- Modify: `docs/ai/tasks/TEMPLATE.md`
- Modify: `docs/ai/subagents/README.md`
- Modify: `docs/ai/subagents/handoff-contract.md`
- Modify: `docs/ai/subagents/planner.md`
- Modify: `docs/ai/subagents/implementer.md`
- Modify: `docs/ai/subagents/reviewer.md`
- Modify: `docs/ai/subagents/tester.md`

- [x] Make the task brief template carry linked artifact paths plus live status fields.
- [x] Require planners to decide which artifact set is needed and create it before implementation.
- [x] Make implementer, reviewer, and tester guidance explicitly read from the same linked artifacts.

### Task 4: Keep the tool adapters aligned

**Files:**
- Modify: `CLAUDE.md`
- Modify: `GEMINI.md`
- Modify: `.agent/rules/repository-playbook.md`
- Modify: `.agent/workflows/plan-task.md`
- Modify: `.agent/workflows/implement-task.md`
- Modify: `.agent/workflows/review-change.md`
- Modify: `.agent/workflows/test-change.md`
- Modify: `.github/copilot-instructions.md`
- Modify: `.github/prompts/Plan Task.prompt.md`
- Modify: `.github/prompts/Implement Task.prompt.md`
- Modify: `.github/prompts/Review Change.prompt.md`
- Modify: `.github/prompts/Test Change.prompt.md`

- [x] Keep the tool adapters thin but aware of the new artifact workflow.
- [x] Ensure planning, implementation, review, and test prompts all point to the same brief and linked spec or plan.

### Task 5: Validate the workflow update

**Files:**
- Modify: `docs/ai/tasks/2026-03-29-agentic-workflow-enforcement.md`

- [x] Run a search to confirm the updated artifact paths are referenced consistently.
- [x] Run the best available repo validation command.
- [x] Update the task brief status and handoff notes with the validation result and any remaining gaps.

### Task 6: Add checklist guidance to the continuity model

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/ai/standards.md`
- Modify: `docs/ai/tasks/README.md`
- Modify: `docs/ai/tasks/TEMPLATE.md`
- Modify: `docs/ai/subagents/planner.md`
- Modify: `docs/ai/subagents/implementer.md`
- Modify: `docs/specs/2026-03-29-agentic-workflow-enforcement.md`
- Modify: `docs/ai/tasks/2026-03-29-agentic-workflow-enforcement.md`

- [x] Require checklist-style tracking for multi-step plans.
- [x] Add checklist guidance to task briefs and subagent responsibilities.
- [x] Update the live task brief so the example artifact uses checklist progress directly.

### Task 7: Record known gaps for future setup work

**Files:**
- Create: `docs/ai/future-work.md`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/specs/2026-03-29-agentic-workflow-enforcement.md`
- Modify: `docs/ai/tasks/2026-03-29-agentic-workflow-enforcement.md`

- [x] Add a shared markdown backlog for known repo gaps and deferred improvements.
- [x] Point the main repo playbook and README at that backlog.
- [x] Fold the backlog into the workflow-enforcement example artifacts so future sessions can find it reliably.
