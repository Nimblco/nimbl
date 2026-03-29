---
description: Scaffolds a new workflow task bundle using the internal CLI
---
# Scaffold Task

When the user asks you to scaffold a task, your goal is to set up their workflow automatically using the project CLI.

1. Convert the user's requested topic into a short, lowercase slug (e.g., \`add-user-auth\`).
2. Run the terminal command: \`pnpm workflow scaffold --slug <topic> --artifacts bundle\`
3. Read the generated markdown files and prompt the user to see if they want you to begin implementation.
