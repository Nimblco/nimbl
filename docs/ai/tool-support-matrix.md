# Tool Support Matrix

This file explains which repository files are necessary, supported, or optional across the current agent tools this boilerplate targets.

## Core files

These are the highest-value files to keep current:

- `AGENTS.md`: primary shared repo playbook for Codex and a useful shared playbook for other tools
- `docs/ai/commands.md`: the single source of truth for build, test, and validation commands
- `docs/ai/standards.md`: repo-wide engineering rules that should stay stable
- `docs/ai/portability.md`: explains how to keep the setup cross-tool and non-fragile
- `docs/specs/`, `docs/plans/`, and `docs/ai/tasks/`: the committed artifacts that preserve design intent, execution steps, and active task state across tool switches
- `package.json` and `pnpm-workspace.yaml`: the default JS or TS workspace root

## Tool-specific files

### Claude Code

- necessary: `CLAUDE.md`
- optional but useful: `.claude/rules/`

### Gemini

- necessary if you want root-level Gemini-specific portability: `GEMINI.md`
- no second rulebook needed; keep it as a thin adapter

### GitHub Copilot

- necessary for repo-wide instructions: `.github/copilot-instructions.md`
- optional but useful: `.github/instructions/`
- optional and preview-only: `.github/prompts/`

### Antigravity

- necessary only if you want workspace customization: `.agent/rules/`
- optional but useful: `.agent/workflows/`

### Cursor

- necessary: `.cursor/rules/repository-playbook.mdc` (`alwaysApply: true` — auto-loaded on every session)
- thin adapter: points to `AGENTS.md` as canonical playbook and lists all workflow CLI commands

### Windsurf

- necessary: `.windsurfrules` at the repo root (auto-loaded by Windsurf on every session)
- same content as the Cursor rule, plain markdown without MDC frontmatter

### Aider

- necessary if you want automatic context injection: `.aider.conf.yml`
- auto-includes `AGENTS.md`, `docs/ai/commands.md`, and `docs/ai/standards.md` as read-only context via the `read:` key

### Continue

- optional: `.continue/config.json`
- adds a `/workflow` custom slash command that prompts the model to load `AGENTS.md` and `docs/ai/commands.md`

### Zed

- no per-project AI instructions convention established yet
- point Zed's AI assistant to `AGENTS.md` manually when starting a task

## Shared subagent files

These are optional for simple repos, but useful when you want repeatable multi-agent coordination:

- `docs/ai/subagents/README.md`
- `docs/ai/subagents/handoff-contract.md`
- `docs/ai/subagents/planner.md`
- `docs/ai/subagents/implementer.md`
- `docs/ai/subagents/reviewer.md`
- `docs/ai/subagents/tester.md`
- `docs/ai/tasks/TEMPLATE.md`

## Agent skills layer

These files make Nimblco's workflow guidance installable into any agent tool that supports the agentskills.io spec:

- `skills/`: four skills (`workflow`, `docs`, `scripts`, `subagents`) with agentskills.io-compliant `SKILL.md` frontmatter; install into any compatible tool via `npx skills add Nimblco/nimblco` or `pnpm workflow skill add Nimblco/nimblco`
- `.claude-plugin/marketplace.json`: Claude Code plugin marketplace descriptor; enables `/plugin marketplace add Nimblco/nimblco` discovery in Claude Code

Compatible tools include Claude Code, GitHub Copilot (via agent mode), Cursor, Windsurf, and any other tool that reads the agentskills.io `skills/` discovery convention.

## Unnecessary or removed

- `.agents/`: removed as duplicate compatibility scaffolding; the current official Antigravity codelab uses `.agent/`

## Lean-context recommendation

For the best balance of capability and token efficiency:

1. keep `AGENTS.md` short
2. keep `CLAUDE.md` as an import shim, not a second rulebook
3. keep `GEMINI.md` as a thin adapter, not a second rulebook
4. load `project-context.md` and `architecture.md` only when the task truly needs them
5. use subagent files only for tasks that benefit from explicit role splitting
