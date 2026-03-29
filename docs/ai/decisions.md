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

## Notes

- Prefer a new entry when a decision would otherwise be easy to forget or reverse incorrectly.
- Use `accepted`, `superseded`, or `rejected` for status values if the team wants a simple lifecycle.
- Avoid recording temporary implementation details here unless they have long-term value.
- Link to a spec or plan when the decision came out of a larger design discussion.
