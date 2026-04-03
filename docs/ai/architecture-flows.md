# Architecture — Data Flows and Key Interfaces

Read this file only when implementing or debugging a specific workflow CLI command or the installer. For module boundaries and conventions, see [`docs/ai/architecture.md`](./architecture.md).

## Data flows

- **Install flow**: `npx nimblco <dir>` → `init-workflow.mjs` reads `CORE_PATHS` from the package root, copies them to the target repo, patches the target's `package.json` with `workflow` and `init-workflow` scripts
- **Scaffold flow**: `pnpm workflow scaffold --slug <topic> --artifacts bundle` → `workflow-lib.mjs:scaffoldWorkflowArtifacts` → writes dated task brief + spec + plan to `docs/ai/tasks/`, `docs/specs/`, `docs/plans/`
- **Check flow**: `pnpm workflow check` → `workflow-lib.mjs:validateTaskBrief` → reads active task brief, checks required fields and linked file existence, error messages include self-recovery hints, exits 0 or 1
- **Pack flow**: `pnpm workflow pack` → reads task brief + git status + optional git diff → writes a markdown handoff pack to `docs/ai/handoffs/`; `--compress` flag appends a repomix snapshot via `readRepomixSnapshot` (runs `npx repomix --compress`)
- **Doctor flow**: `pnpm workflow doctor` → `workflow-lib.mjs:runDoctor` → runs 7 checks (Node ≥ 18, git, docs/ai/, commands.md, tasks/, workflow.mjs, active brief count), prints ✓/⚠/✗ per check, exits 0 on pass/warn or 1 on any failure
- **Finalize flow**: `pnpm workflow finalize` → validates task brief → moves task + spec + plan to their respective `archive/` subdirectories, rewrites internal links

## Key interfaces

- `runCli(argv, options)` — exported from `workflow-lib.mjs`; returns `{ exitCode, stdout, stderr }`; all dependencies injected via `options`
- Task brief markdown schema: fields parsed from `- key: value` bullet lines under `##` heading sections; see `readTaskBrief()` in `workflow-lib.mjs`
- `CORE_PATHS` array in `init-workflow.mjs` — defines exactly what the installer copies; must stay in sync with what the workflow CLI expects to find
