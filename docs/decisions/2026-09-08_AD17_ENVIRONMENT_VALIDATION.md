# AD-17: Environment validation — zod schema, fail-fast aggregated errors (Phase 6)

**Date:** 2026-09-08
**Status:** Accepted — decisions D1–D3 + Q1–Q5 closed; implementation tracked in `docs/plans/2026-09-08_ENVIRONMENT_PHASE6.md`

## Background

P0–P5 delivered the full environment stack: sources/registry, resolution
semantics, standard sources, profiles, typed binding, and observability. The
final roadmap slice is **validation**: a deployer should be able to declare
the shape of the resolved environment and have boot fail loudly (with an
aggregate report) when it's wrong — the t3-env / convict / envalid model,
which the roadmap research flagged as a Phase 6 item.

BlueJS already ships **zod** (blue-dispatcher's `@validatedBy` uses it) — no
new dependency.

## Decision

**D1 — `@environment` zod schema decorator + `describeEnvironment`.** A
`@environment(schema)` class decorator (house camelCase) on a configuration
class declares the zod schema of its resolved environment — the schema _is_
the contract. Also exported directly as `describeEnvironment(schema)` (plain
function form) for ad-hoc use.

**D2 — `validateEnvironment(environment, schema)` free function.** Validates
the environment's resolved values against a zod schema, returning a structured
result: `{ valid, issues: [{ path, expected, actual }] }`. Works on any
`Environment` (prototype or flat; reads through `getProperty`).

- **Aggregate (Q1)**: all failures collected in one report — the validation
  use-case is _precisely_ "see everything wrong at once" (typography typos,
  wrong types across keys); fail-fast would hide all but the first.
- **No coercion (Q2)**: zod's transform/defaults are not applied back into the
  environment — validation _reports_ only. (Coercion is P4 binding's job, and
  the environment is the source of truth; the report is advisory.)
- **Wiring (Q3)**: `ApplicationBuilder.validateWith(schema)` — boot validates
  after the environment is fully prepared (post-customizers, pre-context) and
  **fails boot loudly with the aggregate report** when invalid.

**D3 — `@validated configuration`? No — reuses the existing shape.** The
`@environment` decorator stores the schema in class metadata; the boot
processor that auto-registers `@configurationProperties` also picks up
`@environment` schemas from registered sources and validates them
automatically (no manual call). Plain `validateEnvironment` stays for ad-hoc
use (tests, CLIs).

## Consequences

- Fail-loud boot: an invalid environment aborts startup with a full issue
  list (path / expected / actual) — CI catches config drift immediately.
- No new dependency (zod already in-tree), no coercion surprises (validation
  reports; binding converts).
- Composes with origin (P5): issue entries could later carry `(from source: …)`.

## Revisit Trigger

Revisit if: (a) coercion-into-environment is wanted (validation becomes
transformative — a different contract, never silent); (b) validation needs to
run per-`@configurationProperties`-bind (extend the binder with an optional
schema check post-bind); (c) origin-per-issue becomes a need (append origin
via P5's `originOf` — backward-compatible).
