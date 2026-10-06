# AD-67: Logging core extraction — `@blue/log` leaf package

**Date:** 2026-10-06
**Status:** Accepted — implemented (2026-10-06)

## Context

Wave-3 of the 2026-10-05 remediation routed framework diagnostics through the
shared logger (`getLogger` from `@blue/telemetry/logger`) in `@blue/factory`,
`@blue/platform-node`, and `@blue/test`. For `@blue/factory` (Layer 2) that
created a manifest dependency on `@blue/telemetry` (Layer 4), whose package
root imports the `@blue/context`, `@blue/dispatcher`, and `@blue/router`
framework instrumentations. The result was five package-level dependency
cycles — `factory → telemetry → context → factory` among them — and a
circular Nx task graph: `pnpm build` failed outright, taking the first CI
quality step with it. The logger and severity modules themselves depend only
on `@opentelemetry/api` and `@opentelemetry/api-logs`; the cycle came from
their packaging, not their code.

## Evidence

- `pnpm build` at `5a7a9e20`, reproduced after `pnpm exec nx reset`:
  `NX Could not execute command because the task graph has a circular
dependency: @blue/view-webcomponent:build:lib → @blue/context:build:lib →
@blue/content:build:lib → @blue/factory:build:lib → @blue/telemetry:build:lib
→ @blue/context:build:lib`.
- Parsing every workspace manifest at `HEAD~1..HEAD~3` yields 0 cycles; HEAD
  yielded 5. The closing edge was `@blue/factory`'s `"@blue/telemetry"` entry,
  added for the `@blue/telemetry/logger` subpath import.
- `packages/blue-telemetry/src/logger` and `.../severity` import only
  `@opentelemetry/api*`; `@blue/factory` uses exactly one symbol
  (`getLogger`) from them.
- The instrumentation classes (`ContextInstrumentation`,
  `DispatcherInstrumentation`, `CountedInstrumentation`) were forked in three
  packages; the core `DispatcherInstrumentation` had already drifted behind
  the node/web copies (`_resolveViewName` wrap missing), and
  `blue-telemetry-node/src/instrumentation/counted.ts` was dead code.
- Full findings: `docs/plans/2026-10-06_CODE_REVIEW_AND_MITIGATION.md` §1.1
  (B-1), §1.2 (A-1, A-3).

## Decision

- **D-1 — new leaf package.** `@blue/log` (Layer 1) owns the logging core:
  the `Logger` contract, `LoggerFactory`/`getLogger`, console and
  OpenTelemetry appenders, context-aware wrapping, and the severity mappings.
  Its only dependencies are `@opentelemetry/api` and `@opentelemetry/api-logs`
  — no BlueJS dependencies.
- **D-2 — telemetry re-exports, subpath removed.** `@blue/telemetry` keeps
  `export * from '@blue/log'` so `getLogger` from the umbrella package keeps
  working, but the `@blue/telemetry/logger` subpath is removed (hard cutover,
  pre-1.0): import from `@blue/log` directly.
- **D-3 — consumers point at the leaf.** `@blue/factory`, `@blue/platform-node`,
  and `@blue/test` import `@blue/log`; `@blue/factory` no longer depends on
  `@blue/telemetry`.
- **D-4 — one instrumentation implementation.** The framework
  instrumentations live once in `@blue/telemetry` (the drifted
  `_resolveViewName` span was ported into the core); `@blue/telemetry-node`
  and `@blue/telemetry-web` re-export them and their forked copies are
  deleted, along with the dead node `counted.ts`.
- **D-5 — docs and manifests.** ARCHITECTURE.md (§ Layered Architecture,
  Package Map), the telemetry/`@blue/log` READMEs, guide 10, CHANGELOG, and
  all affected manifests were updated in the same change; `pnpm build` (which
  fails on any Nx task-graph cycle) is the standing acyclicity gate.

## Consequences

- `pnpm build` succeeds again; the workspace has zero package-level cycles
  (verified over all 46 workspace manifests after the change).
- Framework diagnostics keep the shared logger path without dragging the
  telemetry stack below Layer 4: `factory → log` is a downward edge.
- One public package is added (`@blue/log`) and one subpath is removed from
  `@blue/telemetry` — external consumers importing
  `@blue/telemetry/logger` must switch to `@blue/log` (pre-1.0 hard break).
- The instrumentation surface stays where consumers already import it
  (`@blue/telemetry-node` / `@blue/telemetry-web` re-exports); behavior is
  unchanged except the core dispatcher instrumentation gaining the
  `_resolveViewName` span the platform copies already had.

**Revisit trigger:** if another Layer ≤3 package needs more of the telemetry
surface than the logger, do not widen this edge — split the instrumentation
set by platform (node/web) instead, keeping `@blue/telemetry` API-only.
