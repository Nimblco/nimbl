# Repo Skills

This directory stores portable repo-owned skills for agents working in this project.

## Purpose

- keep reusable task logic in versioned markdown files
- let different IDEs and models discover the same instructions from the repository
- avoid turning vendor-specific prompts into a second source of truth

## How to use skills

1. Start with `AGENTS.md`.
2. Check `index.md` for a skill that matches the task, files in play, or requested workflow.
3. Read the matching skill file before editing.
4. Follow shared docs such as `commands.md`, `standards.md`, and `current-task.md` alongside the skill.

## Add a skill

- scaffold a new skill with `pnpm run new skill <skill-name>`
- if you omit the name and run `pnpm run new skill`, the script will prompt for it
- use `pnpm run new skill <skill-name> --dry-run` to preview the changes

## Skill format

Each skill should:

- stay concise and easy to scan
- include a short summary of when to use it
- list trigger phrases, files, or situations
- point back to shared repo docs instead of duplicating them
- include validation or completion expectations when relevant

Use `TEMPLATE.md` when adding a new skill.
