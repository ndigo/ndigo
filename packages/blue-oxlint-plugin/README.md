# Blue Oxlint Plugin

Blue Oxlint Plugin provides custom oxlint rules that enforce BlueJS architecture conventions.

## Installation

```bash
pnpm add -D @blue/oxlint-plugin
```

## Rules

1. `@blue/no-direct-integration-imports` — Forbids importing encapsulated libraries outside their
   integration packages.
2. `@blue/no-internal-file-imports` — Forbids cross-package imports of internal files (`_*.ts`).
3. `@blue/no-internal-file-exports` — Forbids barrel re-exports of internal files.

## Integration Layer Concept

BlueJS uses integration layer packages to wrap external libraries with stable framework-facing
contracts:

- `@blue/util` encapsulates utilities such as `ramda` and `date-fns`
- `@blue/parser` encapsulates `arcsecond`

This plugin helps ensure that other BlueJS packages import through those integration layers rather
than directly from encapsulated libraries.
