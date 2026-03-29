---
paths:
  - "**/*"
---

# CLI Workflow Execution

When the user asks you to scaffold, check, or finish a task, rely entirely on the provided workflow CLI:

1. **Scaffold**: Run \`pnpm workflow scaffold --slug <topic> --artifacts bundle\` in your terminal tool. Create a brief summary of the generated files.
2. **Check**: Run \`pnpm workflow check\` in your terminal tool. If the check returns errors, use your file editing tools to add the missing fields or links to the active task brief and rerun the check.
3. **Finish**: Run \`pnpm workflow finalize\` in your terminal tool. If the archiving fails because the task brief is incomplete, mark it as complete and run the finishing command again.
