---
description: Performs rigorous code review checking for bugs, regressions, and docs drift
---
# Review Change

Use the repository playbook in [AGENTS.md](../../AGENTS.md), the current task brief, any linked spec or plan, the standards in [standards.md](../../docs/ai/standards.md), the commands in [commands.md](../../docs/ai/commands.md), and the reviewer role in [reviewer.md](../../docs/ai/subagents/reviewer.md).

Review the current change set with a bug-finding mindset.

Focus on:

1. correctness and likely regressions
2. missing tests or weak validation
3. docs drift
4. risky assumptions or hidden coupling

Return findings ordered by severity, followed by open questions and a short summary.
