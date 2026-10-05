---
name: planning-and-task-breakdown
description: Breaks specs into implementable tasks. Use when you have a spec and need implementable units.
---

# Planning and Task Breakdown

## Overview

Decompose specs into small, verifiable tasks with acceptance criteria and dependency ordering.

## When to Use

- After creating a spec
- Before implementing a feature
- When work feels too large

## The Process

### 1. Identify Components

From the spec, identify what needs to be built:

- Database/Schema changes
- API endpoints
- Business logic
- UI components
- Tests

### 2. Determine Dependencies

What must be built first?

```
Task A → Task B → Task C
```

### 3. Identify Parallel Opportunities

What can be built simultaneously?

- Different modules
- Different features
- Frontend/backend (with contract)

### 4. Create Tasks

Each task should be:

- **Specific**: Clear about what it does
- **Small**: Completable in 1-2 hours
- **Verifiable**: Has acceptance criteria

## Task Template

```markdown
- [ ] Task: [Description]
    - Objective: [What this achieves]
    - Acceptance: [What must be true when done]
    - Verify: [How to confirm]
    - Depends: [Tasks that must complete first]
    - Files: [Files to touch]
```

## Example Task Breakdown

### Feature: Task Management

```
Tasks:
- [ ] Task 1: Create task table schema
  - Objective: Store tasks in DB
  - Acceptance: Migration runs, table exists
  - Verify: `npx prisma db push`

- [ ] Task 2: Create task API endpoints
  - Objective: CRUD operations
  - Acceptance: All endpoints work
  - Verify: API tests pass

- [ ] Task 3: Add task service logic
  - Objective: Business logic for tasks
  - Acceptance: Service methods work
  - Verify: Unit tests pass

- [ ] Task 4: Build task UI
  - Objective: User interface for tasks
  - Acceptance: Users can interact
  - Verify: Manual testing
```

## Wave Grouping

Group tasks into waves:

```
Wave 1 (no dependencies):
- Schema
- Basic API

Wave 2 (depends on Wave 1):
- Service logic
- More API endpoints

Wave 3 (depends on Wave 2):
- Full UI
- Integration tests
```

## Working with Agents

When assigning tasks:

```
"Implement Task 2: Create task API endpoints.

Dependencies: Task 1 (schema must exist)
Acceptance criteria: All CRUD endpoints work
Files: src/api/tasks.ts, tests/api/tasks.test.ts"
```

### Routing

When implementation is delegated to specialized agents, route by task type:

| Task Type                                                   | Delegate To               |
| ----------------------------------------------------------- | ------------------------- |
| New classes, functions, modules, decorators, services, APIs | `source-writer`           |
| Refactoring, renaming, extracting utilities, moving code    | `source-writer`           |
| Extending existing features, modifying source code          | `source-writer`           |
| `package.json`, `tsconfig.json`, workspace configs          | `tooling-writer`          |
| CI/CD pipelines, shell scripts, build scripts               | `tooling-writer`          |
| Dependency additions/removals, workspace config             | `tooling-writer`          |
| Unit tests                                                  | `test-writer`             |
| Integration tests                                           | `test-writer`             |
| Markdown documentation, Mermaid/DOT diagrams                | `docs-writer`             |
| Codebase mapping / feasibility research                     | `explorer`                |

Give the delegate full context in the brief: objectives, acceptance
criteria, files to touch, and what NOT to touch — a delegate has no memory
of the parent conversation. Verify each completed task before the wave
advances.

## Common Rationalizations

| Rationalization       | Reality                          |
| --------------------- | -------------------------------- |
| "I'll figure it out"  | Unclear scope leads to rework    |
| "Tasks are too small" | Small tasks are easier to verify |
| "I know what to do"   | Written tasks prevent confusion  |

## Red Flags

- Tasks > 400 lines
- No clear dependencies
- No acceptance criteria
- Tasks spanning multiple features

## Verification

- [ ] Each task has acceptance criteria
- [ ] Dependencies are clear
- [ ] Tasks are small enough
- [ ] Parallel opportunities identified
