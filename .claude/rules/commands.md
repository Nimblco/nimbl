---
paths:
  - "**/*"
---

# CLI Workflow Execution

When the user asks you to scaffold, check, or finish a task, rely entirely on the provided workflow CLI:

1. **Scaffold**: Run \`pnpm workflow scaffold --slug <topic> --artifacts bundle\` in your terminal tool. Create a brief summary of the generated files.
2. **Check**: Run \`pnpm workflow check\` in your terminal tool. If the check returns errors, use your file editing tools to add the missing fields or links to the active task brief and rerun the check.
3. **Finish**: Run \`pnpm workflow finalize\` in your terminal tool. If the archiving fails because the task brief is incomplete, mark it as complete and run the finishing command again.4. **Pack**: Run `pnpm workflow pack` to write a handoff pack to `docs/ai/handoffs/`. Use `--to <tool>` for a tool-specific prompt and `--compress` to include a repomix codebase snapshot.
5. **Doctor**: Run `pnpm workflow doctor` before starting work to verify the workflow layer is properly installed and all required files are present.
6. **Skills**: Run `pnpm workflow skill add <repo>` to install agentskills.io-compatible skills from a remote repository into `skills/`.