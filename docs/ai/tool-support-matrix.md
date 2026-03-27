# Tool Support Matrix

This file explains which repository files are necessary, supported, or optional across the current agent tools this boilerplate targets.

## Core files

These are the highest-value files to keep current:

- `AGENTS.md`: primary shared repo playbook for Codex and a useful shared playbook for other tools
- `docs/ai/commands.md`: the single source of truth for build, test, and validation commands
- `docs/ai/standards.md`: repo-wide engineering rules that should stay stable
- `docs/ai/portability.md`: explains how to keep the setup cross-tool and non-fragile
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

## Shared subagent files

These are optional for simple repos, but useful when you want repeatable multi-agent coordination:

- `docs/ai/subagents/README.md`
- `docs/ai/subagents/handoff-contract.md`
- `docs/ai/subagents/planner.md`
- `docs/ai/subagents/implementer.md`
- `docs/ai/subagents/reviewer.md`
- `docs/ai/subagents/tester.md`
- `docs/ai/tasks/TEMPLATE.md`

## Unnecessary or removed

- `.agents/`: removed as duplicate compatibility scaffolding; the current official Antigravity codelab uses `.agent/`

## Lean-context recommendation

For the best balance of capability and token efficiency:

1. keep `AGENTS.md` short
2. keep `CLAUDE.md` as an import shim, not a second rulebook
3. keep `GEMINI.md` as a thin adapter, not a second rulebook
4. load `project-context.md` and `architecture.md` only when the task truly needs them
5. use subagent files only for tasks that benefit from explicit role splitting
