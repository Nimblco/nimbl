---
description: Automatically scans the codebase to generate foundational PRD and Project Context documents
---
# Setup Context

When the user asks to setup context, your goal is to fully populate `docs/ai/project-context.md` and generate a foundational product requirements document (PRD).

1. Scan the repository root files (`README.md`, `package.json`, or other manifest files) to understand the nature of the project.
2. If `docs/ai/project-context.md` is empty or generic, fill in the "Summary", "Goals", "Constraints", "Non-goals", and "Rules of thumb" based on your findings and reasonable technical assumptions.
3. Scaffold a foundational PRD in a new file inside `docs/specs/` or `docs/product/prd.md` detailing the core features, MVP scope, and key architecture decisions.
4. Present a summary of what you deduced about the project to the user and ask them to refine or review the drafted documents.
