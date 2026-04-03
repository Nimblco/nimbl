---
name: workflow
description: Scaffold, check, and finalize AI workflow artifacts using the Nimblco CLI. Use when creating task briefs, specs, or plans, or when running workflow validation and handoff commands.
license: MIT
---

# CLI Workflow Execution

When the user asks you to scaffold, check, or finish a task, rely entirely on the provided workflow CLI:

1. **Scaffold**: Run `pnpm workflow scaffold --slug <topic> --artifacts bundle` to create a dated task brief plus matching spec and plan. Use `--artifacts task` for a brief-only scaffold.
2. **Check**: Run `pnpm workflow check` to validate required fields and linked artifacts. If the check returns errors, fix the flagged fields in the active task brief and rerun.
3. **Pack**: Run `pnpm workflow pack` to write a portable handoff pack to `docs/ai/handoffs/`. Use `--to <tool>` to target a specific agent tool, `--stdout` to print instead of writing, or `--compress` to include a repomix codebase snapshot.
4. **Handoff**: Run `pnpm workflow handoff --to <tool>` to print a copy-pasteable resume prompt for the next agent tool.
5. **Finish**: Run `pnpm workflow finalize` to validate and archive a completed workflow bundle to `archive/` subdirectories. If archiving fails because the task brief is incomplete, fix the brief and rerun.
