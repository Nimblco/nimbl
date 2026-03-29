---
description: Scaffolds a new workflow task bundle using the internal CLI
---
1. Identify the topic the user wants to start working on from their prompt.
2. Convert that topic into a short, lowercase slug (e.g., \`add-user-auth\`).
// turbo
3. Formulate and run the command: \`pnpm workflow scaffold --slug <topic> --artifacts bundle\`.
4. Read the newly generated \`docs/ai/tasks/<date>-<topic>.md\` file.
5. Summarize the initial task setup to the user and ask if they are ready for you to begin planning or implementing.
