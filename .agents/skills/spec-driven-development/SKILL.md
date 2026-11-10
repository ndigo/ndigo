---
name: spec-driven-development
description: Creates specs before coding. Use when starting a new project, feature, or significant change and no specification exists yet.
---

# Spec-Driven Development

## Overview

Write a structured specification before writing any code. The spec is the shared source of truth between you and the human engineer — it defines what we're building, why, and how we'll know it's done.

## When to Use

- Starting a new project or feature
- Requirements are ambiguous or incomplete
- The change touches multiple files or modules
- You're about to make an architectural decision
- The task would take more than 30 minutes to implement

**When NOT to use:** Single-line fixes, typo corrections, or changes where requirements are unambiguous.

## The Gated Workflow

Spec-driven development has four phases:

```
SPECIFY ──→ PLAN ──→ TASKS ──→ IMPLEMENT
```

### Phase 1: Specify

Ask clarifying questions first. Surface assumptions immediately:

```
ASSUMPTIONS I'M MAKING:
1. [assumption about tech stack]
2. [assumption about data model]
→ Correct me now or I'll proceed with these.
```

Write a spec covering these six core areas:

1. **Objective** — What are we building and why? User stories or acceptance criteria.
2. **Commands** — Full executable commands with flags.
3. **Project Structure** — Where source code lives, where tests go.
4. **Code Style** — One real code snippet showing your style.
5. **Testing Strategy** — What framework, coverage expectations.
6. **Boundaries** — Three-tier system:
    - **Always do:** Run tests before commits, validate inputs
    - **Ask first:** Database schema changes, adding dependencies
    - **Never do:** Commit secrets, remove failing tests

### Phase 2: Plan

Generate a technical implementation plan:

- Identify major components and dependencies
- Determine implementation order
- Note risks and mitigation strategies
- Define verification checkpoints

### Phase 3: Tasks

Break into discrete, implementable tasks:

- Each task completable in one session
- Each has acceptance criteria
- Each includes verification step

### Phase 4: Implement

Execute tasks following `incremental-implementation` skill.

## Spec Template

```markdown
# Spec: [Project/Feature]

## Objective

[What we're building and why]

## Commands

Build: [command]
Test: [command]
Lint: [command]

## Project Structure

[Directory layout]

## Code Style

[Example snippet]

## Testing Strategy

[Framework, coverage]

## Boundaries

- Always: [...]
- Ask first: [...]
- Never: [...]

## Success Criteria

[Specific, testable conditions]

## Open Questions

[Anything unresolved]
```

## Common Rationalizations

| Rationalization                       | Reality                                     |
| ------------------------------------- | ------------------------------------------- |
| "This is simple, I don't need a spec" | Simple tasks still need acceptance criteria |
| "I'll write the spec after"           | That's documentation, not specification     |
| "The spec will slow us down"          | 15-minute spec prevents hours of rework     |

## Red Flags

- Starting to write code without written requirements
- Implementing features not mentioned in any spec
- Making architectural decisions without documenting them

## Verification

Before proceeding to implementation, confirm:

- [ ] Spec covers all six core areas
- [ ] Success criteria are specific and testable
- [ ] Boundaries are defined
