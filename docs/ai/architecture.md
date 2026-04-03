# Architecture Notes

Use this file to describe the current system shape, major module boundaries, and the conventions that matter when changing the codebase.

Keep it current enough that a new agent can understand where things live, what belongs where, and what should not be coupled together without reading the whole repo.

## System overview

- entry points:
  - `scripts/init-workflow.mjs` — interactive CLI installer; run via `npx nimblco <target-dir>` to copy the workflow layer into another repo
  - `scripts/workflow.mjs` — thin wrapper that delegates to `runCli()` in `workflow-lib.mjs`; used inside a target repo as `pnpm workflow <command>`
- main modules:
  - `scripts/workflow-lib.mjs` — all workflow CLI logic as pure, injectable functions; the only module with tests
  - `scripts/init-workflow.mjs` — installer: detects ecosystem, prompts user, copies `CORE_PATHS`, patches `package.json`, generates context docs
  - `scripts/check.ps1` / `scripts/check.sh` — cross-platform validation entry points that detect the available toolchain and run lint/test/build/typecheck
  - `scripts/bootstrap.ps1` / `scripts/bootstrap.sh` — install dependencies without requiring global pnpm
- shared libraries or packages: none — the repo has no workspace packages; all logic is in root-level scripts
- agent skills layer:
  - `skills/` — agentskills.io-compliant skill definitions; each subdirectory holds a `SKILL.md` with YAML frontmatter; installable via `npx skills add Nimblco/nimblco` into any compatible agent tool
  - `.claude-plugin/marketplace.json` — Claude Code plugin marketplace descriptor pointing to the `skills/` subdirectories
- external services: none — no network calls at runtime; reads and writes local files and git only; optional `repomix` and `skills` CLIs are invoked on demand via `npx`

## Boundaries

- `workflow-lib.mjs` must stay a pure-function module with injectable dependencies (`clipboardWriter`, `commandRunner`, `now`) — no direct `process.exit`, no top-level side effects
- `workflow.mjs` is the only place that calls `process.exitCode` or writes to stdout/stderr directly
- `init-workflow.mjs` is intentionally stateful and interactive; it is not tested via the unit test suite
- doc templates (`docs/specs/TEMPLATE.md`, `docs/plans/TEMPLATE.md`, `docs/ai/tasks/TEMPLATE.md`) must stay in sync with the scaffold output rendered by `renderTaskBriefTemplate`, `renderSpecTemplate`, and `renderPlanTemplate` in `workflow-lib.mjs`
- tool adapter files (`.claude/`, `.github/`, `.agent/`, `CLAUDE.md`, `GEMINI.md`) must stay thin — they point back to `AGENTS.md` and shared docs rather than duplicating guidance
- `skills/` must contain only SKILL.md files with valid agentskills.io frontmatter (`name` matching the parent directory name, `description` ≤ 1024 chars); no agent-specific syntax inside SKILL.md bodies
- `CORE_PATHS` in `init-workflow.mjs` is the authoritative list of what gets copied into target repos; add new top-level directories here when introducing new repo-level layers

## Data flow and key interfaces

See [`docs/ai/architecture-flows.md`](./architecture-flows.md) for detailed command flows and interface contracts.

## Conventions

- naming: dated filenames (`YYYY-MM-DD-slug.md`) for task briefs, specs, and plans; `kebab-case` for slugs
- folder layout: `docs/ai/tasks/` for active task briefs, `docs/specs/` for specs, `docs/plans/` for plans; each has an `archive/` subdirectory for completed work
- error handling: `WorkflowError` class for expected user-facing errors; all errors caught at the top of `runCli` and returned as `{ exitCode: 1, stderr: message }`
- testing strategy: unit tests in `tests/workflow-cli.test.mjs` using Node's built-in `node:test`; each test creates an isolated temp directory fixture; `init-workflow.mjs` is not unit tested
- deployment or runtime assumptions: Node.js >=18; no compiled output; scripts run directly with `node`

## Open questions

- ~~question 1: should `init-workflow.mjs` gain a `--no-interactive` / `--yes` flag for CI-based installs?~~ Resolved — `--yes` / `-y` flag implemented.
- question 2: should the npm `files` field explicitly include dotfolders, or rely on `.npmignore`? Current approach: `files` field in `package.json` whitelists published paths; no `.npmignore` yet.

## Keep this file healthy

- Record stable architectural truths and important boundaries.
- Move task-specific design work into specs and plans.
- Update this file when module ownership, system shape, or major flows change.
