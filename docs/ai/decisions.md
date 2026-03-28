# Engineering Decisions

Track meaningful technical decisions here.

### Lean portable context stack

- date: 2026-03-28
- status: accepted
- context: The repository is intended to work across Codex now, with Copilot and possibly Antigravity later. Relying on tool-specific prompts or chat history makes active work hard to transfer between IDEs or models.
- decision: Keep shared repo context in `AGENTS.md` plus the docs under `docs/ai/`, and use `docs/ai/current-task.md` as the single active-work handoff file. Treat vendor-specific prompts, workflows, and path rules as optional layers rather than required sources of context.
- consequences: Context transfer becomes simpler and more predictable across tools. The repo gains one small manual handoff file to maintain, while tool-specific layers stay thinner and less likely to drift.

---

### Repo-owned skill library

- date: 2026-03-28
- status: accepted
- context: The repository needs reusable agent workflows that remain available across Codex, Copilot, Antigravity, and similar tools without depending on IDE-local prompt systems.
- decision: Store reusable agent skills in `docs/ai/skills/` with a shared index, lightweight front matter, and plain markdown bodies. Adapters should tell tools to consult the shared skill index instead of maintaining separate skill logic per IDE.
- consequences: Skills become versioned repo assets that can move with the codebase. The team must keep the skill index concise and avoid duplicating shared docs inside each skill.

---

### Lean default surface area

- date: 2026-03-28
- status: accepted
- context: The repo should optimize for small default context loads across tools. Optional prompt packs and workflow wrappers add surface area but are not required for the current setup.
- decision: Keep the shared docs, skills, and thin adapters. Remove the unused `.github/prompts/` and `.agent/workflows/` layers from the default boilerplate.
- consequences: The repo stays easier to scan and cheaper to load. If a future workflow proves valuable enough, it can be reintroduced deliberately instead of staying as dormant scaffolding.

---

## Template

### Decision title

- date:
- status:
- context:
- decision:
- consequences:

---

Add new decisions to the top once the project is active.
