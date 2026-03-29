# Project Context

Use this file for durable product context that every agent should understand before making changes.

Capture product-owned facts here, not implementation history. If something changes often, belongs to a single initiative, or is only true for the current task, put it in a spec, plan, or task brief instead.

This file should answer, "What product is this repo for, and what stable context should a new teammate know before touching it?"

## Summary

- project name: Nimblco
- what the product does: installs a portable agentic workflow layer into any repository so AI coding agents have a consistent operating model
- the main problem it solves: agents lose task state between sessions and across tools; Nimblco keeps specs, plans, and task briefs committed to the repo so work can resume from the repo itself
- primary users: developers adopting AI coding agents (GitHub Copilot, Claude Code, Gemini, Codex, Antigravity) who want reproducible, cross-tool workflows
- why it exists: existing scaffolds are either tool-specific or require manual setup per project; Nimblco provides a one-command installer that works for any language or stack

## Goals

- goal 1: make it trivially easy to embed a durable agent workflow into any repo via `npx nimblco <dir>`
- goal 2: keep task state, specs, and plans committed to plain markdown so any tool or agent can resume work without chat history
- goal 3: stay tool-agnostic — the core model works the same whether the agent is Copilot, Claude Code, Gemini, or Codex

## Constraints

- technical: Node.js >=18 is the only runtime dependency for the installer CLI; the installed layer itself is pure markdown and shell scripts, so it works in any repo regardless of language
- business: open-source under MIT; published to npm as `nimblco`
- delivery: keep the installer non-destructive by default — existing files in the target repo are never overwritten without `--force`

## Non-goals

- non-goal 1: Nimblco is not a project management tool or issue tracker
- non-goal 2: Nimblco does not run or orchestrate agents itself — it provides the shared context layer that agents read

## Product rules of thumb

- workflows or promises the product must preserve: the installed layer must stay resumable from a fresh clone with no chat history
- user experience principles worth protecting: one command to install, zero friction to start the first task brief
- regulatory, privacy, or security expectations: no credentials, tokens, or user data are stored or transmitted; the tool only reads and writes local files
- terms or concepts that have specific meanings in this product:
  - **task brief**: a committed markdown file in `docs/ai/tasks/` that tracks the current status, next action, and linked artifacts for one piece of work
  - **bundle**: a matched set of task brief + spec + plan files created together by `workflow scaffold --artifacts bundle`
  - **workflow layer**: the full set of files Nimblco installs — playbooks, scripts, tool adapters, and doc templates

## Notes for coding agents

- preferred languages or frameworks: Node.js ESM for the workflow CLI; plain markdown for all docs and templates
- deployment target: npm package, invoked via `npx nimblco <target-dir>`
- quality bar: all workflow CLI behavior must be covered by tests in `tests/workflow-cli.test.mjs`
- performance or security requirements: no network calls; no shell interpolation of user-supplied input
- product vocabulary to preserve: task brief, spec, plan, bundle, finalize, archive, handoff, scaffold
- links to source-of-truth docs: `docs/ai/commands.md`, `docs/ai/standards.md`, `AGENTS.md`

## Keep this file healthy

- Prefer durable facts over temporary plans.
- Update this file when the product direction changes in a lasting way.
- Link to deeper source documents when they exist, but keep the essentials readable here.
