# Commands

Use this file as the single place to document the best-known commands for this repository.

Subagent roles should reference this file instead of inventing commands in prompts or handoff notes.

## Current starter commands

### Bootstrap

- PowerShell: `powershell -Command "corepack enable"`
- PowerShell: `pnpm install`
- PowerShell: `./scripts/bootstrap.ps1`
- Bash: `corepack enable`
- Bash: `pnpm install`
- Bash: `./scripts/bootstrap.sh`

### Validation

- `pnpm run lint --if-present`
- `pnpm test --if-present`
- `pnpm run build --if-present`
- `pnpm run typecheck --if-present`
- PowerShell: `./scripts/check.ps1`
- PowerShell with execution-policy bypass: `powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1`
- Bash: `./scripts/check.sh`

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
