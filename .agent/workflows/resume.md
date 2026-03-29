---
description: Autonomously maps and resumes the active task brief
---
1. Read `AGENTS.md` and `docs/ai/standards.md` to establish your core rules.
2. Programmatically scan `docs/ai/tasks/` for the `.md` file that has `- status: active`.
3. Read that active task brief and its linked `- spec:` and `- plan:`.
4. Read *only* the specific files listed under the `## Relevant files` heading. Do not scan the entire workspace.
5. Summarize the `next action` to the user in the chat, and state that you have successfully assumed the context and are ready to execute!
