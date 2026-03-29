# Spec: workflow pack

## Purpose

Add a portable handoff-pack command that exports the current task state into one markdown artifact that can be pasted into or attached to another LLM or IDE.

## Scope

- in scope: a new `workflow pack` command; default markdown file output; optional stdout/copy/output overrides; optional git diff inclusion; docs updates
- out of scope: raw chat transcript export; JSON exports; automatic upload to third-party tools

## Proposed behavior

The workflow CLI should gain a `pack` command that resolves the selected task brief the same way `status`, `resume`, and `handoff` already do. By default it should write a markdown file under `docs/ai/handoffs/`, named from the task topic and date so the pack is easy to locate and share.

The pack should contain the current workflow state in a compact format: task brief path, linked spec and plan paths, current status, next action, blockers, relevant files, validation commands, and a ready-to-paste prompt. It should also include a changed-file list derived from git so another tool can quickly see which parts of the repo have moved.

The command should support a tool target just like `handoff`, plus transport options that make the pack usable across environments. `--stdout` should print the full pack instead of writing a file. `--copy` should copy the generated pack text. `--output <path>` should override the default handoff path. `--include-diff` should append git diff content, but only when explicitly requested so the default pack stays compact.

If git information is unavailable, the command should still generate a useful pack and should describe that limitation in the output rather than failing silently. The pack should stay markdown-first and readable without custom tooling.

## Acceptance criteria

- [ ] `workflow pack` writes a markdown handoff file under `docs/ai/handoffs/`
- [ ] `workflow pack --to gemini` includes a gemini-targeted prompt block
- [ ] `workflow pack --stdout` prints the full pack text without requiring a file
- [ ] `workflow pack --copy` copies the generated pack text
- [ ] `workflow pack --include-diff` includes a git diff section while the default pack does not
- [ ] docs explain `workflow pack` as the portable export path for other LLMs and IDEs

## Constraints

- technical: extend the existing workflow CLI instead of creating a second exporter
- product: keep the default pack concise enough for cross-tool use
- delivery: preserve backward compatibility for existing workflow commands and task resolution rules

## Risks and open questions

- risk 1: invoking git from the CLI introduces environment-dependent failure cases that should degrade gracefully
- risk 2: pack templates could drift from task/spec/plan structure if workflow docs evolve without updating the exporter
- question 1: whether a later JSON mode should share the same source data model; current answer is yes, but it is out of scope here

## Related docs

- plan: [2026-03-29-workflow-pack.md](../plans/2026-03-29-workflow-pack.md)
- task brief: [2026-03-29-workflow-pack.md](../ai/tasks/2026-03-29-workflow-pack.md)
- product doc: none
