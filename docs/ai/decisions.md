# Engineering Decisions

Use this file for durable decisions that affect how the product or repository should evolve.

Keep entries short, specific, and ordered with the newest decision at the top. This file is intentionally shared across two kinds of durable tradeoffs:

- reusable workflow-layer decisions for this repo and its operating model
- product-owned decisions for the downstream codebase that adopts the starter

Replace the template below with real decisions as those tradeoffs emerge.

## What belongs here

- workflow continuity rules that should stay true across tasks and tool switches
- durable repo-level decisions about validation, packaging, or workspace structure
- product architecture choices that future contributors could reverse incorrectly without context

## Starter note

When this repo itself changes as a reusable starter, record those decisions here too. Do not treat this file as product-only.

## Template

### Decision title

- date:
- status:
- context:
- decision:
- consequences:

### Workflow handoffs export as markdown packs

- date: 2026-03-29
- status: accepted
- context: prompt-only handoffs were useful for direct tool switching, but they did not give another IDE or LLM a single portable artifact with current task state, linked docs, and repo change context
- decision: add a `workflow pack` command that writes a markdown handoff file by default, includes changed-file context out of the box, and only includes raw git diff content when explicitly requested
- consequences: cross-tool transfers can use one markdown file instead of a raw chat transcript; the default output stays compact for token-limited tools; the pack format now becomes part of the workflow surface that docs and starter scripts must keep current

### Workflow CLI stays non-interactive-first

- date: 2026-03-29
- status: accepted
- context: the repo's workflow model depends on consistent task/spec/plan bundles, but agents were still creating those artifacts manually and relying on memory for required fields
- decision: add a `workflow scaffold` command and keep the workflow CLI non-interactive-first so agents and scripts can create aligned artifacts deterministically; use explicit `none` values for intentionally omitted spec or plan links
- consequences: `workflow check` can validate clearer task-brief shapes; docs can point to one default entrypoint; interactive helpers remain possible later without becoming the primary interface

### Skills layer aligned with agentskills.io spec

- date: 2026-04-04
- status: accepted
- context: the `.claude/rules/` files held guidance that only reached Claude Code users; other agent tools had no discoverable equivalent; the agentskills.io standard defines a `skills/` directory shape that 40+ agent tools can consume via `npx skills add`
- decision: convert the four `.claude/rules/` behaviour guides into `skills/<name>/SKILL.md` files with compliant YAML frontmatter; add `.claude-plugin/marketplace.json` for Claude Code plugin discovery; keep `.claude/rules/` intact for backward compatibility
- consequences: guidance is now installable into any agent tool that supports the spec; the `CORE_PATHS` installer list was expanded to include `skills/` and `.claude-plugin/`; downstream repos that install Nimblco receive the full skills layer automatically

### Repomix --compress integrated as optional pack flag

- date: 2026-04-04
- status: accepted
- context: handoff packs were useful for task state transfer but contained no codebase snapshot; large codebases require additional context for an incoming agent to reason about the full repo without scanning every file
- decision: add `pnpm workflow pack --compress` which calls `npx repomix --compress` as an optional side-process and appends the compressed snapshot to the pack; the flag is opt-in and gracefully falls back with an informational note when repomix is unavailable
- consequences: pack files can optionally carry a token-efficient codebase snapshot; no new required dependency; repomix is fetched on demand via `npx --yes`

## Notes

- Prefer a new entry when a decision would otherwise be easy to forget or reverse incorrectly.
- Use `accepted`, `superseded`, or `rejected` for status values if the team wants a simple lifecycle.
- Avoid recording temporary implementation details here unless they have long-term value.
- Link to a spec or plan when the decision came out of a larger design discussion.
