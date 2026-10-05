---
name: incremental-implementation
description: Delivers changes incrementally. Use when implementing any feature or change that touches more than one file.
---

# Incremental Implementation

## Overview

Build in thin vertical slices — implement one piece, test it, verify it, then expand. Each increment should leave the system in a working, testable state.

## When to Use

- Implementing any multi-file change
- Building a new feature from a task breakdown
- Any time you're tempted to write more than ~100 lines before testing

**When NOT to use:** Single-file, single-function changes where scope is minimal.

## The Increment Cycle

```
Implement ──→ Test ──→ Verify ──→ Commit ──→ Next slice
```

For each slice:

1. **Implement** the smallest complete piece
2. **Test** — run test suite
3. **Verify** — confirm the slice works
4. **Commit** — save progress with descriptive message
5. **Move to next slice**

## Slicing Strategies

### Vertical Slices (Preferred)

Build one complete path through the stack:

```
Slice 1: Create task (DB + API + basic UI)
    → Tests pass, user can create via UI

Slice 2: List tasks (query + API + UI)
    → Tests pass, user can see tasks

Slice 3: Edit task (update + API + UI)
    → Tests pass, user can modify

Slice 4: Delete task (delete + API + UI + confirmation)
    → Tests pass, full CRUD complete
```

### Risk-First Slicing

Tackle the riskiest piece first:

```
Slice 1: Prove the critical path works (highest risk)
Slice 2: Build on proven foundation
```

## Implementation Rules

### Rule 0: Simplicity First

Ask: "What is the simplest thing that could work?"

```
SIMPLICITY CHECK:
✗ Generic EventBus with middleware
✓ Simple function call

✗ Abstract factory for two components
✓ Two straightforward components
```

### Rule 1: One Thing at a Time

Each increment changes one logical thing. Don't mix concerns.

### Rule 2: Keep It Compilable

After each increment, project must build and tests must pass.

### Rule 3: Feature Flags for Incomplete Features

```typescript
const ENABLE_FEATURE = process.env.FEATURE_ENABLED === 'true';
if (ENABLE_FEATURE) { ... }
```

### Rule 4: Safe Defaults

New code should default to conservative behavior:

```typescript
const shouldNotify = options?.notify ?? false;
```

### Rule 5: Rollback-Friendly

Each increment should be independently revertable:

- Additive changes are easy to revert
- Modifications should be minimal
- Avoid deleting and replacing in the same commit

## Working with Agents

When directing implementation:

```
"Let's implement Task X from the plan.
Start with just [first step].
Don't touch [other parts] yet — we'll do that in the next increment.

After implementing, run tests and build to verify."
```

## Common Rationalizations

| Rationalization                         | Reality                                          |
| --------------------------------------- | ------------------------------------------------ |
| "I'll test it all at the end"           | Bugs compound. Test each slice.                  |
| "It's faster to do it all at once"      | Bug in Slice 1 makes Slices 2-5 wrong.           |
| "These changes are too small to commit" | Small commits are free. Large commits hide bugs. |

## Red Flags

- More than 100 lines written without running tests
- Multiple unrelated changes in one increment
- Build or tests broken between increments
- Touching files outside the task scope

## Verification

After each increment:

- [ ] Change does one thing completely
- [ ] All existing tests pass
- [ ] Build succeeds
- [ ] Change is committed

After all increments:

- [ ] Each increment individually tested and committed
- [ ] Full test suite passes
- [ ] Feature works end-to-end
