# AD-51: Subpath exports for cohesive feature sets

**Date:** 2026-02-11
**Status:** Accepted — partially adopted (see verified extent below)

## Context

`@blue/http/transformers` (introduced by the transform-pipeline plan, AD-49)
established a modern subpath-export pattern: cohesive, optional feature sets
exposed as `@blue/pkg/subpath` instead of through the main entry point. The
plan evaluates rolling this pattern out monorepo-wide (e.g. `@blue/logger/layouts`)
to improve API clarity, encapsulation, and tree-shaking.

## Evidence

- `docs/plans/2026-02-11_SUBPATH_EXPORTS_ANALYSIS.md` is a **DRAFT** — a
  read-only analysis with a phase plan (candidate identification, evaluation,
  generic implementation blueprint) and no decisions or recommendations table
  filled in; no monorepo-wide rollout was committed.
- **Verified subpath adoption in current `package.json` `exports` (2026-10-04):**
    - `@blue/http`: `"."` + `"./transformers"` (transform pipeline, per AD-49).
    - `@blue/redis`: `"."` + `"./cache"` + `"./pubsub"` — born with the package
      `c6d68a09` (2026-10-03).
    - `@blue/util`: `"."` + `"./math"` + `"./string"` + `"./types"` — from the
      module-based reorganization `4e7cad21` (2026-01-28).
    - NO subpaths: `@blue/orm-drizzle` (`"."` only), `@blue/socket` (`"."` only),
      `@blue/core` (`"."` only); `@blue/logger` has no `exports` field at all.
- `@blue/http`'s `./transformers` subpath maps to
  `./lib/transformers/index.js` (`packages/blue-http/package.json`).

## Decision

- D-1 Adopt subpath exports as the pattern for cohesive, optional feature sets
  (established canonically by `@blue/http/transformers`).
- D-2 Apply it where packages already organize into such feature modules.

## Consequences

- Adopted in: `@blue/http` (`./transformers`), `@blue/redis` (`./cache`,
  `./pubsub`), `@blue/util` (`./math`, `./string`, `./types`). The broader
  rollout proposed in the draft plan (e.g. `@blue/logger/layouts`,
  `@blue/orm-drizzle`, `@blue/socket`) was NOT implemented; those packages keep
  a single `.` entry.

## References

- Plan: `docs/plans/2026-02-11_SUBPATH_EXPORTS_ANALYSIS.md`
- Implementation: `exports` fields in `packages/blue-http/package.json`,
  `packages/blue-redis/package.json`, `packages/blue-util/package.json`
- Related: [AD-49](2026-02-07_AD49_HTTP_TRANSFORM_PIPELINE.md) (origin of the
  `transformers` subpath)

## Revisit Trigger

Revisit when a package's cohesive feature module (logger layouts, ORM dialect
helpers, socket transport) reaches the threshold where separating it from the
main entry point improves tree-shaking or hides implementation depth.
