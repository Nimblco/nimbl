# Commands

Use this file as the single place to document the best-known commands for this repository.

Subagent roles should reference this file instead of inventing commands in prompts or handoff notes.

## Current starter commands

These commands are for contributors working on the Nimblco package itself. If you have installed Nimblco into another repo, refer to that repo's `docs/ai/commands.md` for its project-specific commands.

### Bootstrap

- PowerShell: `npm.cmd exec --yes -- pnpm install`
- PowerShell: `pnpm install`
- PowerShell: `./scripts/bootstrap.ps1`
- Bash: `npm exec --yes -- pnpm install`
- Bash: `pnpm install`
- Bash: `./scripts/bootstrap.sh`

### Validation

- `pnpm run lint`
- `pnpm run test`
- `pnpm run build`
- `pnpm run typecheck`
- PowerShell: `./scripts/check.ps1`
- PowerShell with execution-policy bypass: `powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1`
- Bash: `./scripts/check.sh`

### Workflow switching

- `pnpm workflow scaffold --slug <topic> --artifacts bundle` creates a dated task brief plus matching spec and plan
- `pnpm workflow scaffold --slug <topic> --artifacts task` creates a dated task brief only and records `spec: none` plus `plan: none`
- `pnpm workflow check` validates required task-brief fields and linked workflow artifacts
- `pnpm workflow pack` writes a portable markdown handoff pack under `docs/ai/handoffs/`
- `pnpm workflow pack --to gemini` writes a pack with a gemini-ready prompt block
- `pnpm workflow pack --stdout` prints the pack instead of writing a file
- `pnpm workflow pack --include-diff` appends git diff details when deeper handoff context is needed
- `pnpm workflow finalize` validates the active task brief, then archives the completed bundle (task + linked spec + plan) to `archive/` subdirectories
- `pnpm workflow archive --task <path-to-completed-task-brief>` archives a completed bundle without running validation (use when the brief is already known-good)
- `pnpm workflow handoff --to gemini`
- `pnpm workflow handoff --to claude`
- `pnpm workflow resume`
- `pnpm workflow status`
- `pnpm workflow pack --compress` writes a handoff pack with a repomix-compressed codebase snapshot appended (requires `npx repomix` to be available)
- `pnpm workflow skill add <repo>` installs skills from a remote repository using the agentskills.io CLI (for example: `pnpm workflow skill add Nimblco/nimblco`)
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- scaffold --slug <topic> --artifacts bundle`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- scaffold --slug <topic> --artifacts task`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- pack --to gemini`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- handoff --to gemini`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- status`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- check`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- finalize --task <path-to-completed-task-brief>`
- Bash fallback without global `pnpm`: `npm run workflow -- scaffold --slug <topic> --artifacts bundle`
- Bash fallback without global `pnpm`: `npm run workflow -- scaffold --slug <topic> --artifacts task`
- Bash fallback without global `pnpm`: `npm run workflow -- pack --to gemini`
- Bash fallback without global `pnpm`: `npm run workflow -- check`
- Bash fallback without global `pnpm`: `npm run workflow -- handoff --to gemini`

## How to evolve this file

When working in a repo where Nimblco has been installed, replace the bootstrap and validation sections above with the actual commands for that project:

- install
- dev
- lint
- test
- build
- database or migrations
- e2e or smoke tests

Keep commands copy-pasteable and current.
