# Portability Rules

This repository is designed so you can switch AI coding tools without rewriting the repo setup.

## Canonical source of truth

- `AGENTS.md` is the canonical shared playbook
- `docs/ai/commands.md` is the canonical commands file
- `docs/ai/standards.md` is the canonical engineering-rules file
- `docs/ai/current-task.md` is the canonical active-work handoff file
- `docs/ai/skills/` is the canonical repo-owned skill library
- `package.json` and `pnpm-workspace.yaml` are the canonical JS or TS workspace entrypoints

## Adapter strategy

- `CLAUDE.md` should stay a thin adapter, not a second playbook
- `GEMINI.md` should stay a thin adapter, not a second playbook
- `.github/copilot-instructions.md` should stay short and point back to shared docs
- `.agent/rules/` should stay short and point back to shared docs
- active task state should live in `docs/ai/current-task.md`, not in vendor-only prompts
- reusable skill logic should live in `docs/ai/skills/`, not in vendor-only prompts

## Portability guidelines

- do not put core repository rules only inside a vendor-specific file
- do not rely on one tool's proprietary feature for essential project context
- keep vendor-specific prompt files and workflows optional
- prefer plain markdown docs over tool-only config when the guidance is meant for everyone
- prefer a shared handoff file over chat-only memory when work moves between tools
- prefer repo-owned skills over IDE-local prompt libraries when you want cross-tool reuse

## When to add a new adapter

Add a new root adapter only if:

- the tool has an official or common root instruction filename
- the adapter can stay short
- it points back to the shared docs instead of creating a new source of truth
