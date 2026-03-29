---
description: Formalizes an Architecture Decision Record (ADR) detailing major tech choices
---
# Log Decision

When the user asks to log a decision or generate an ADR, you must capture the context and technical tradeoff formally.

1. Read the most recent conversation and active `docs/ai/tasks/` to understand the technical decision just made.
2. If `docs/ai/decisions.md` does not exist, create it with an initial Markdown `# Architecture Decisions` heading.
3. Append a new Architecture Decision Record (ADR) section to `docs/ai/decisions.md` using the following format:
   - **Date:** YYYY-MM-DD
   - **Context/Problem:** (Why are we making this change?)
   - **Decision:** (What technology, pattern, or dependency did we choose?)
   - **Tradeoffs:** (Pros and cons, and why other options were discarded)
4. Update the active task brief to indicate the decision was logged.
5. Provide a summary of the logged decision to the user in the chat!
