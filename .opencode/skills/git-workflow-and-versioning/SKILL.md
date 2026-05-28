---
name: git-workflow-and-versioning
description: Version control best practices. Use when making any code change.
---

# Git Workflow and Versioning

## Overview

Use trunk-based development with atomic commits. Commits are save points — small, frequent commits make debugging easy and rollbacks safe.

## When to Use

- Making any code change
- Starting a new feature
- Fixing a bug

## Trunk-Based Development

Work directly on main or short-lived branches:
- Branch lives < 1 day
- Merge frequently
- Small, focused changes

## Atomic Commits

Each commit does one thing:
- Add one feature
- Fix one bug
- Refactor one concern

**Good:** "Add task creation endpoint"
**Bad:** "Add tasks and fix styling and refactor"

## Change Sizing

- Ideal: ~100 lines
- Maximum: ~400 lines
- Split larger changes

> Changes should be reviewable in 10 minutes.

## Commit Messages

Structure:
```
<type>: <short description>

<body> (optional)

<footer> (optional)
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`

Examples:
```
feat: Add task completion endpoint

- POST /tasks/:id/complete
- Sets completedAt timestamp
- Returns updated task
```

## The Commit-as-Save-Point Pattern

```
Make a commit after each small task:
- Easier to rollback
- Easier to find bugs
- Better history
```

## Branch Naming

```
feature/add-task-notifications
bugfix/fix-task-completion-date
refactor/improve-error-handling
```

## Workflow

```
1. Create branch (or work on main for small fixes)
2. Make changes in small increments
3. Test each increment
4. Commit with descriptive message
5. Push and create PR
6. Review and merge
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll commit later" | You won't |
| "It's not ready" | Small commits are safe |
| "I want to commit all at once" | Hard to review, harder to rollback |

## Red Flags

- Commits > 400 lines
- Commit messages like "WIP" or "fixes"
- Multiple unrelated changes in one commit
- Main branch broken for days

## Verification

After commit:
- [ ] Change does one thing
- [ ] Message is descriptive
- [ ] Tests pass
- [ ] Build succeeds