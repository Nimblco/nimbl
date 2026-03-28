# Tool Support Matrix

## Core files

- `AGENTS.md`: primary shared repo playbook for Codex and a useful shared playbook for other tools
- `docs/ai/commands.md`: the single source of truth for build, test, and validation commands
- `docs/ai/standards.md`: repo-wide engineering rules that should stay stable
- `docs/ai/current-task.md`: active-task handoff that survives IDE or model switching
- `docs/ai/skills/`: repo-owned reusable skills that multiple tools can discover
- `docs/ai/portability.md`: explains how to keep the setup cross-tool and non-fragile
- `package.json` and `pnpm-workspace.yaml`: the default JS or TS workspace root

## Tool-specific files

### Claude Code

- necessary: `CLAUDE.md`
- optional but useful: `.claude/rules/`

### Gemini

- necessary if you want root-level Gemini-specific portability: `GEMINI.md`
- keep it as a thin adapter

### GitHub Copilot

- necessary for repo-wide instructions: `.github/copilot-instructions.md`
- optional when Copilot needs extra path-specific help: `.github/instructions/`

### Antigravity

- necessary only if you want workspace customization: `.agent/rules/`

## Shared subagent files

- `docs/ai/subagents/README.md`
- `docs/ai/subagents/handoff-contract.md`
- `docs/ai/subagents/planner.md`
- `docs/ai/subagents/implementer.md`
- `docs/ai/subagents/reviewer.md`
- `docs/ai/subagents/tester.md`
- `docs/ai/tasks/TEMPLATE.md`

## Unnecessary or removed

- `.agents/`: removed as duplicate compatibility scaffolding; the current official Antigravity codelab uses `.agent/`
- `.github/prompts/`: removed to keep the default surface area smaller
- `.agent/workflows/`: removed for the same reason; the shared repo docs remain the source of truth

## Lean-context recommendation

For the best balance of capability and token efficiency:

1. keep `AGENTS.md` short
2. keep `CLAUDE.md` as an import shim, not a second rulebook
3. keep `GEMINI.md` as a thin adapter, not a second rulebook
4. keep repo-owned skills in `docs/ai/skills/` and load them by need
5. keep `docs/ai/current-task.md` current whenever work spans tools or sessions
6. load `project-context.md` and `architecture.md` only when the task truly needs them
7. use subagent files only for tasks that benefit from explicit role splitting
