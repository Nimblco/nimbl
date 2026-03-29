# Commands

Use this file as the single place to document the best-known commands for this repository.

Subagent roles should reference this file instead of inventing commands in prompts or handoff notes.

## Current starter commands

This starter does not require Corepack. If `pnpm` is not installed globally, run `pnpm` commands through `npm exec --yes -- pnpm ...` (PowerShell: `npm.cmd exec --yes -- pnpm ...`).

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

- `pnpm workflow finalize` archives a completed workflow bundle: task brief plus linked spec and plan when present
- `pnpm workflow handoff --to gemini`
- `pnpm workflow handoff --to claude`
- `pnpm workflow resume`
- `pnpm workflow status`
- `pnpm workflow check`
- `pnpm workflow finalize`
- `pnpm workflow archive --task <path-to-completed-task-brief>`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- handoff --to gemini`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- status`
- PowerShell fallback without global `pnpm`: `npm.cmd run workflow -- finalize --task <path-to-completed-task-brief>`
- Bash fallback without global `pnpm`: `npm run workflow -- handoff --to gemini`

## How to evolve this file

Once the real app stack exists, replace this section with the actual commands for:

- install
- dev
- lint
- test
- build
- database or migrations
- e2e or smoke tests

Keep commands copy-pasteable and current.
