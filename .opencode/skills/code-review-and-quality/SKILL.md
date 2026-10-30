---
name: code-review-and-quality
description: Structured code review. Use when reviewing any code change before merging.
---

# Code Review and Quality

## Overview

Review code thoroughly before merging. A codebase with good reviews is a team multiplier — poor reviews train bad habits, great reviews spread knowledge.

## When to Use

- Before merging any pull request
- Before committing significant changes
- When asked to review another engineer's code

**When NOT to use:** Minor typo fixes, obvious documentation improvements.

## Five-Axis Review

Review code on all five axes:

### 1. Correctness

- Does the code do what it's supposed to?
- Are edge cases handled?
- Does it handle error conditions?

### 2. Design

- Is the code in the right place?
- Does it follow project architecture?
- Are abstractions appropriate?

### 3. Readability

- Is the code easy to understand?
- Are variable/function names clear?
- Are comments helpful (not redundant)?

### 4. Security

- Are inputs validated?
- Is sensitive data protected?
- Are auth/authorization checks in place?

### 5. Performance

- Are there obvious inefficiencies?
- Is there unnecessary computation?
- Are queries optimized?

## Change Sizing

- Ideal change: ~100 lines
- Maximum: ~400 lines per PR
- Larger changes should be split

> "Would a staff engineer approve this?"

## Severity Labels

| Label        | Meaning                | Action Required       |
| ------------ | ---------------------- | --------------------- |
| **Nit**      | Minor style/formatting | Optional fix          |
| **Optional** | Could improve          | Consider fixing       |
| **FYI**      | Note for future        | No action now         |
| **Must Fix** | Bug or security issue  | Required before merge |
| **Block**    | Blocks merge           | Must fix to proceed   |

## Findings Report Contract

When a review is consumed by another agent (not read by a human), return a
structured report, one entry per finding:

- `id`: stable short identifier (e.g., `REV-001`)
- `severity`: `CRITICAL` | `WARNING` | `SUGGESTION`
- `category`: correctness/design/readability/security/performance/style/
  complexity/gap/testing/docs
- `file`: path
- `lines`: exact line or range when available
- `description`: problem statement
- `impact`: why it matters
- `recommendation`: concrete resolution guidance

End with an approval recommendation: `approve`, `approve-with-changes`, or
`request-changes`. Group findings by severity; never return vague feedback
without file/line references.

## Specialist Reviewers

For large or high-risk changes, split the review by domain instead of one
agent covering everything:

| Domain                 | Reviewer                        |
| ---------------------- | ------------------------------- |
| Correctness, design, style, complexity, gaps, a11y | `code-reviewer` (all axes) |
| Security + dependency audit          | `security-reviewer`             |
| Markdown, API docs, diagrams         | `documentation-reviewer`        |

Merge the specialist reports into one consolidated findings list; drop
duplicate findings, keep the strongest statement of each. Specialist
reviewers are read-only — fixes are implemented by the appropriate writer,
then re-reviewed.

## Review Process

### Before Writing the Review

1. Read the spec/documents first
2. Understand what the code is supposed to do
3. Run the code locally if possible

### During the Review

1. Check correctness first
2. Check design and architecture
3. Check readability and style
4. Check security
5. Check performance

### Writing the Review

- Be specific: quote the code you're referring to
- Explain why it's an issue
- Suggest a fix (not just "fix this")
- Distinguish must-fix from nitpick

## Example Review Comments

````
### Correctness

The input validation is missing:
```typescript
// Current
function createTask(title: string) { ... }

// Should validate input
function createTask(title: string) {
  if (!title?.trim()) {
    throw new ValidationError('Title is required');
  }
}
````

### Design

This belongs in a separate service:

- Creating tasks is a task-service responsibility
- Consider moving to `TaskService.createTask()`

### Security

User input isn't escaped:

- Potential XSS if this is rendered in HTML
- Use `escapeHtml()` before rendering

```

## What to Look For

### Correctness
- Does the logic match the spec?
- Are boundary conditions checked?
- What happens on error?

### Design
- Single responsibility principle?
- Appropriate abstraction level?
- Reusable components?

### Readability
- Clear naming?
- Self-documenting code?
- Helpful comments?

### Security
- Input validation?
- SQL injection?
- XSS prevention?
- Secrets handling?

### Performance
- N+1 queries?
- Unnecessary operations?
- Caching opportunities?

## Common Issues Found

| Issue | Example | Fix |
|-------|---------|-----|
| Missing validation | `createTask(input)` | Add input checks |
| Magic values | `if (status === 1)` | Use constants |
| No error handling | `await something()` | Add try/catch |
| Not async-aware | `data = await fetch()` | Handle promises |
| Leaking secrets | `console.log(password)` | Remove debug logs |

## Anti-Patterns in Review

- **Rubber stamping**: Approving without real review
- **Style-only focus**: Catching style but missing bugs
- **Author should know**: Not providing feedback
- **Too many nitpicks**: Focus on must-fix issues

## Review Speed Norms

- First review within 24 hours
- Subsequent rounds within 4 hours
- Don't blocker on nitpicks

## Red Flags

- No tests in PR
- Breaking existing tests
- Missing error handling
- Security vulnerabilities
- Overly complex code

## Verification

After review:
- [ ] All five axes covered
- [ ] Must-fix issues separated from nits
- [ ] Suggestions are specific and actionable
- [ ] No blocking issues left unaddressed
```
