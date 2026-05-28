---
name: debugging-and-error-recovery
description: Fixes bugs systematically. Use when tests fail, builds break, or behavior is unexpected.
---

# Debugging and Error Recovery

## Overview

Debug systematically: reproduce, localize, reduce, fix, guard. Never guess — let evidence guide you.

## When to Use

- Tests fail
- Build breaks
- Behavior is unexpected
- Errors in console or logs

## Five-Step Triage

### Step 1: Reproduce

Make the bug happen consistently. If you can't reproduce it, you can't fix it.

```
Steps to reproduce:
1. [specific actions that trigger the bug]
2. [expected behavior]
3. [actual behavior]
```

### Step 2: Localize

Find where the bug lives. Use:
- Binary search (comment out half, see if bug persists)
- Stack traces
- Console logs
- DevTools inspection

### Step 3: Reduce

Create the smallest possible reproduction:
- Minimal test case
- Remove unrelated code
- Isolate the failing path

### Step 4: Fix

Implement the fix:
- Write a failing test first (Prove-It pattern)
- Fix the code
- Verify test passes

### Step 5: Guard

Prevent the bug from returning:
- Add regression test
- Add validation
- Update error messages

## Debugging Techniques

### Binary Search
```
Is the bug in first half? Comment out second half.
└→ Bug persists → Bug is in first half
   Bug gone → Bug is in second half
Repeat until isolated.
```

### Stack Trace Analysis
```
Error: Cannot read property 'x' of undefined
    at calculateTotal (cart.js:45)
    at handleOrder (order.js:12)
    at processOrder (checkout.js:8)
```
- Start from the top
- The first frame is usually where things go wrong
- Work backward to find the cause

### Logging Strategy
```typescript
// Before: Too much logging
console.log('A');
console.log('B');
console.log('C');

// After: Targeted logging
console.log('DEBUG: cart items:', cart.items); // Only what's relevant
console.log('DEBUG: total:', total);
```

## Common Patterns

### Undefined/Nul
```
TypeError: Cannot read property 'x' of undefined

Fix:
- Add null check
- Add default value
- Validate inputs
```

### Async Issues
```
Bug: Data not showing after save
Fix: Await the async operation
```

### Race Conditions
```
Bug: Inconsistent state
Fix: Proper locking/sequencing
```

### Off-by-One
```
Bug: Last item missing
Fix: Check boundary conditions
```

## Working with Agents

When debugging with an agent:

```
"The test is failing with [error].
Reproduce the bug first, then fix it.
Run tests after to confirm."
```

## Stop-The-Line Rule

When tests fail or builds break:
1. STOP — Don't continue coding
2. REPRODUCE — Confirm the bug
3. FIX — Resolve before proceeding
4. VERIFY — Confirm fix works

> "A bug found later costs 10x more to fix."

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It works on my machine" | Doesn't matter if it fails in production |
| "It's probably a race condition" | Still needs to be fixed |
| "I'll come back to it later" | You won't |

## Red Flags

- Debugging without reproduction
- Guessing at the fix
- Not running tests after fix
- No regression test added

## Verification

After fixing:
- [ ] Bug is reproduced consistently
- [ ] Fix makes the test pass
- [ ] All tests pass
- [ ] Regression test added