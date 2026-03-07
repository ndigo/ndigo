---
name: blue-testing
description: BlueJS testing conventions using Vitest for unit and integration tests.
---

# Blue Testing

## Test Framework

- Use Vitest.

## File Naming

- Unit tests: `*.spec.ts`
- Integration tests: `*.test.ts`

## Expectations

- Add coverage for happy path and error paths.
- Prefer minimal necessary mocking in integration tests.
- Tests may import external dependencies directly for mocking/test utilities.

## Commands

```bash
pnpm vitest run <path-to-test-file>
pnpm test
```

## Consistency Rules

- Keep test names descriptive and behavior-focused.
- Use `describe`, `it`/`test`, `expect`, and setup/teardown hooks consistently.
