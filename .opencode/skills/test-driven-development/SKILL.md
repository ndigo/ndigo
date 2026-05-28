---
name: test-driven-development
description: Drives development with tests. Use when implementing any logic, fixing any bug, or changing any behavior.
---

# Test-Driven Development

## Overview

Write a failing test before writing the code that makes it pass. For bug fixes, reproduce the bug with a test before attempting a fix. Tests are proof — "seems right" is not done.

## When to Use

- Implementing any new logic or behavior
- Fixing any bug (the Prove-It Pattern)
- Modifying existing functionality

**When NOT to use:** Pure configuration changes, documentation updates, or static content changes.

## The TDD Cycle

```
    RED                GREEN              REFACTOR
 Write a test    Write minimal code    Clean up the
 that fails  ──→  to make it pass  ─→  implementation  ──→  (repeat)
```

### Step 1: RED — Write a Failing Test

Write the test first. It must fail:

```typescript
// RED: This test fails because createTask doesn't exist yet
describe('TaskService', () => {
  it('creates a task with title and default status', async () => {
    const task = await taskService.createTask({ title: 'Buy groceries' });
    expect(task.title).toBe('Buy groceries');
    expect(task.status).toBe('pending');
  });
});
```

### Step 2: GREEN — Make It Pass

Write the minimum code to make the test pass. Don't over-engineer.

### Step 3: REFACTOR — Clean Up

With tests green, improve the code without changing behavior.

## The Prove-It Pattern (Bug Fixes)

When a bug is reported, **do not start by trying to fix it.** Start by writing a test that reproduces it:

```
Bug report arrives
       │
       ▼
  Write a test that demonstrates the bug (FAILS)
       │
       ▼
  Implement the fix
       │
       ▼
  Test PASSES (proving the fix works)
       │
       ▼
  Run full test suite (no regressions)
```

## The Test Pyramid

Invest testing effort according to the pyramid:

```
          ╱╲
         ╱  ╲        E2E Tests (~5%)
        ╱    ╲
       ╱──────╲
      ╱        ╲      Integration Tests (~15%)
     ╱          ╲
    ╱────────────╲
   ╱              ╲    Unit Tests (~80%)
  ╱                ╲
 ╱──────────────────╲
```

## Test Sizes

| Size | Constraints | Speed |
|------|------------|-------|
| **Small** | Single process, no I/O | Milliseconds |
| **Medium** | Multi-process, localhost | Seconds |
| **Large** | External services allowed | Minutes |

Small tests should make up the vast majority of your suite.

## Writing Good Tests

### Test State, Not Interactions

Assert on the *outcome*, not on which methods were called internally:

```typescript
// Good: Tests what the function does
it('returns tasks sorted by creation date', async () => {
  const tasks = await listTasks();
  expect(tasks[0].createdAt).toBeGreaterThan(tasks[1].createdAt);
});
```

### Use the Arrange-Act-Assert Pattern

```typescript
it('marks overdue tasks', () => {
  // Arrange
  const task = createTask({ deadline: new Date('2025-01-01') });
  // Act
  const result = checkOverdue(task, new Date('2025-01-02'));
  // Assert
  expect(result.isOverdue).toBe(true);
});
```

### One Assertion Per Concept

```typescript
// Good: Each test verifies one behavior
it('rejects empty titles', () => { ... });
it('trims whitespace from titles', () => { ... });

// Bad: Everything in one test
it('validates titles correctly', () => { ... });
```

## Test Anti-Patterns to Avoid

| Anti-Pattern | Problem |
|---|---|
| Testing implementation details | Tests break when refactoring |
| Mocking everything | Tests pass but production breaks |
| No test isolation | Tests pass individually but fail together |

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll write tests after the code works" | You won't. Tests written after test implementation, not behavior. |
| "This is too simple to test" | The test documents expected behavior. |
| "I tested it manually" | Manual testing doesn't persist. |

## Red Flags

- Writing code without any corresponding tests
- Tests that pass on first run (may not be testing what you think)
- Bug fixes without reproduction tests

## Verification

After completing any implementation:
- [ ] Every new behavior has a corresponding test
- [ ] All tests pass: `pnpm test`
- [ ] Bug fixes include reproduction test that failed before fix