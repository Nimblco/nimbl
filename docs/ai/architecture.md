# Architecture Notes

Use this file to describe the current system shape, major module boundaries, and the conventions that matter when changing the codebase.

Keep it current enough that a new agent can understand where things live, what belongs where, and what should not be coupled together without reading the whole repo.

Focus on the real product architecture, not the starter workflow history.

## System overview

- entry points:
- main modules:
- shared libraries or packages:
- external services:

## Boundaries

- what belongs in each major folder or package:
- what should not cross module boundaries:
- which code owns shared types or contracts:
- which parts are reusable infrastructure versus product-specific code:

## Data flow

Describe the important request, build, or processing flows once they exist.

## Key interfaces

- public APIs, events, or contracts other modules depend on:
- shared schemas, message shapes, or persistence models:
- integration points with third-party systems:

## Conventions

- naming:
- folder layout:
- error handling:
- testing strategy:
- deployment or runtime assumptions:

## Open questions

- question 1:
- question 2:

## Keep this file healthy

- Record stable architectural truths and important boundaries.
- Move task-specific design work into specs and plans.
- Update this file when module ownership, system shape, or major flows change.
