# Commands

Use this file as the canonical command list for the repository.

## Bootstrap

- `pnpm install`
- `./scripts/bootstrap.ps1`
- `./scripts/bootstrap.sh`
- `pnpm run new skill <skill-name>`

## Validation

- `pnpm run lint --if-present`
- `pnpm test --if-present`
- `pnpm run build --if-present`
- `pnpm run typecheck --if-present`
- `./scripts/check.ps1`
- `powershell -ExecutionPolicy Bypass -File .\scripts\check.ps1`
- `./scripts/check.sh`

## When the stack becomes real

- replace starter commands with real install, dev, lint, test, build, database, and e2e commands
