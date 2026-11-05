# Environment Phase 6 — Validation: zod schema, fail-fast aggregated reports

**Date:** 2026-09-08
**Status:** Draft — awaiting review (Q1–Q5)
**Roadmap:** Final phase of the Environment roadmap, on P0–P5 (`a5aec4c6`, AD-11..16). Validation is the deployer-facing contract: declare the environment's shape with zod (already in-tree — ndigo-dispatcher's `@validatedBy`), get a loud, aggregate failure at boot when the resolved values don't match.

## 1 · Objective

User stories:

1. **As a deployer**, I declare `@environment(z.object({ server: z.object({ port: z.coerce.number().min(1) }) }))` on my config class and boot **fails with every violation listed** (path, expected, actual) when the environment disagrees.
2. **As a library author**, I call `validateEnvironment(environment, schema)` directly and get a structured `{ valid, issues }` — no boot dependency.

Non-goals (explicit): coercion into the environment (P4 binding owns conversion), per-`@configurationProperties`-bind validation (a post-bind follow-up), origin-per-issue (P5's `originOf` is additive later).

## 2 · Current state (evidence)

| Area              | Today                                                                | Gap                                  |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------ |
| Zod availability  | ndigo-dispatcher uses zod (`@validatedBy`) — **in-tree, no new dep** | Not wired to environment             |
| Fail-loud boot    | P4/P5: missing/bad bindings throw                                    | No aggregate config-shape validation |
| Config-class hook | `@configurationProperties` metadata + boot auto-registration (P4)    | No schema slot                       |
| Origin            | `originOf` (P5)                                                      | Error-message composition (later)    |

## 3 · Decisions (proposed — review Q1–Q5)

### D1 — `@environment(schema)` class decorator + `describeEnvironment(schema)`

- `@environment(zoidSchema)` on a configuration class stores the schema in class metadata (`boot:environmentSchema`) — the schema IS the contract. Direct `describeEnvironment(schema)` export for ad-hoc use.
- **Q5 — location**: ndigo-context (schema is an environment contract, decorator alongside `@property`) vs ndigo-boot (where validation runs). Ndigo-context already has the decorator machinery; zod becomes a context dep (it's already a _dispatcher_ dep — adding to context is a new edge on a used package, Q4).

### D2 — `validateEnvironment(environment, schema)` free function

- Reads the environment via `getProperty` (any strategy); returns `{ valid, issues: [{ path, expected, actual }] }`.
- **Aggregate (Q1)**: collect ALL issues — the validation use-case is "see everything wrong at once"; fail-fast previews one.
- **No coercion (Q2)**: report only; zod transforms/defaults are not written back — the environment stays the source of truth, binding converts.

### D3 — Boot wiring + auto-validation

- `ApplicationBuilder.validateWith(schema)` → boot validates after full preparation (post-customizers, pre-context), fails boot with the **aggregate report** (Q3 — fail boot loudly, consistent with P4/P5).
- The boot auto-registration processor (P4) also picks up `@environment` schemas from registered sources — no manual call.

## 4 · Project structure

```
packages/ndigo-context/src/
  environment-schema.ts  NEW  — @environment decorator + describeEnvironment + validateEnvironment
packages/ndigo-boot/src/
  application.ts         EDIT — validateWith wiring, auto-validation
  application-builder.ts EDIT — validateWith(...)
packages/ndigo-context/test/
  environment-schema.spec.ts NEW
packages/ndigo-boot/test/
  environment-schema.spec.ts EDIT/NEW — boot validation report
```

## 5 · Code style

Matches P0–P5. No new deps beyond zod (already in tree — Q4).

## 6 · Testing strategy

- `validateEnvironment`: valid → `{ valid: true, issues: [] }`; wrong types, missing keys, constraint violations → aggregate issues with path/expected/actual; nested schemas; `getProperty` reads (not coercion).
- Boot: `validateWith` fails run() with the issue list; a valid schema boots; `@environment` on a registered source auto-validates.

## 7 · Boundaries

- **Always:** full suite + lint + format; P0–P5 specs keep green; no coercion writes; no new deps beyond zod.
- **Ask first:** coercing values back into the environment; running validation per-bind; new dep beyond zod.
- **Never:** silently skip an invalid environment (validation is fail-loud); write transformed values back.

## 8 · Success criteria (testable)

1. `validateEnvironment` returns aggregate issues (path/expected/actual) for wrong types + missing keys + constraint violations; `valid: true` when clean.
2. `@environment` decorate + auto-validation in boot: invalid fails run(), listing all issues; valid boots.
3. `validateWith(schema)` wired on the builder.
4. No coercion writes (environment unchanged after validation).
5. Full monorepo suite / lint / format / graft green.

## 9 · Rollout

1. `environment-schema.ts` (decorator + describeEnvironment + validateEnvironment) + specs.
2. Boot `validateWith` + auto-validation + specs.
3. Full suite; ADR (AD-17).

## 10 · Open questions

- **Q1 — Aggregate vs fail-fast (resolved → aggregate)**: validation's whole point is the full report (independent violations surface together; P4's fail-fast was for _dependent_ binding errors).
- **Q2 — Coercion (resolved → report-only)**: env is the source of truth; writing zod transforms back would silently rewrite deployer config (binding converts per-field, P4).
- **Q3 — Invalid boot (resolved → fail loudly)**: silent config drift is the bug the arc eliminates; P4/P5 parity.
- **Q4 — New dep edge (resolved → zod into ndigo-context manifest)**: already installed via dispatcher — only a new package edge, no new bytes.
- **Q5 — Location (resolved → ndigo-context)**: decorator machinery there; schema is an environment contract; boot imports from context.
