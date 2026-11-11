# AD-103: Validation-error stack capture — one stack per failure

**Date:** 2026-11-11
**Status:** Proposed — recommends keeping the thrown
`ParameterConversionError` stack and constructing its `ZodValidationError`
cause without stack capture. No implementation until sign-off; #387/#393
landed the empty-shape failure templates with the two-error shape unchanged.

## Context

`validatedBy` (`@ndigo/dispatcher`, AD-07) is the Zod binding seam. On a
rejected payload it constructs two `Error`s:

1. a `ZodValidationError` carrying the flattened message and normalized
   `issues`, and
2. a `ParameterConversionError` that is thrown with the former as `.cause`.

The second is the error an application sees and may log or report. The first
is a structured payload that the default Node resolver reads via `instanceof`
and `.issues`.

Measurement (same host, Vitest serial lane, `binding.bench.ts`): the invalid
non-empty path is 10.3–10.5 µs; an empty body was 10.47 µs before #387 and
8.9–9.7 µs after. `safeParse` plus issue normalization accounts for ~1.6–2.2 µs
of that; the rest is `Error` construction. Disabling stack capture around both
constructions took the full path from 11.97 µs to 4.68 µs (plan
`2026-11-11_PERF_TRIVIAL_CASE_SHORTCUTS.md` §3.5), i.e. ~7.3 µs, or ~3.6 µs per
stack. Two stacks are roughly 60–70% of the rejection path.

Why this is a policy decision rather than a mechanical shortcut:

- 422 problem+json responses never expose stacks: the Node resolver renders
  `detail` plus the structured `errors` array.
- The default Node adapter logs `error.stack` only when an error escapes to a
  500; a resolved binding failure returns 422 without touching the logger.
- Applications may still log `.cause` or forward errors to APM. `.stack` is
  part of the public `Error` surface even when the default resolver never reads
  it.
- Error identity is frozen by AD-91 D1: `ParameterConversionError` and
  `ZodValidationError` are exported symbols, and `instanceof` branches exist in
  the Node resolver and the reference Conduit app.

The question is therefore not whether the two-error shape can be faster, but
which stack a client-validation failure actually needs.

The duplication is concrete: both stacks are captured one call frame apart in
the same `toConversionError` helper. The cause's stack contains no caller
information the thrown error's stack lacks.

## Decision

**D-1 — Keep exactly one stack per validation failure: the thrown error's.**
`ParameterConversionError` continues to capture a stack. The
`ZodValidationError` cause is constructed without stack capture and `.stack`
carries only its `name: message` header (V8) — it is documented as a structured
payload, not an independently thrown error.

**D-2 — Scope suppression to the cause alone.** Set
`Error.stackTraceLimit = 0` immediately before constructing the cause and
restore the previous value in a `finally`. The window is synchronous, contains
no user code, and ends before the thrown `ParameterConversionError` is
constructed. The global must never remain toggled.

**D-3 — V8 fast path, portable fallback.** `Error.stackTraceLimit` is a V8
extension (Node, Chrome/Edge, Deno, Bun). Engines without it ignore the
assignment and keep their default capture behavior: the optimization disappears,
correctness does not change. No framework behavior reads the limit.

**D-4 — No other error-shape change.** `ZodValidationError` stays exported and
an `Error` subclass; `.message` and `.issues` are unchanged.
`ParameterConversionError.cause` remains that `ZodValidationError`. Resolvers,
tests, and the 422 contract stay as they are.

## Options considered

| Option                                            | Effect on the 10.5 µs path           | Assessment                                                                                                                 |
| :------------------------------------------------ | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| Keep two stacks (status quo)                      | 0                                    | Pays ~2.2–3.6 µs for a second stack that duplicates the first's call site.                                                 |
| Suppress both stacks                              | −60% (11.97 → 4.68 µs, measured)     | The thrown error loses the only stack; the default 500 path and APM lose the location. Diagnostic loss for framework bugs. |
| **One stack — cause suppressed (recommended)**    | **≈ −2.0 to −3.6 µs (~−20 to −34%)** | Removes only the duplicate stack; the thrown error keeps full diagnostic value.                                            |
| Throw a single error type                         | ≈ −35–45%                            | Public-shape change under the 1.0 freeze; Node resolver and apps branch on `instanceof`; larger diff for no extra speed.   |
| Reuse a `ZodValidationError` per issues signature | ≈ −50%                               | Shared mutable `Error` across requests; stale stack if ever read; concurrency-hostile.                                     |

## Consequences

Positive: the rejection path loses roughly a third of its error-construction
cost — −2.0 µs measured in the construction lane, −3.6 µs implied by the bench
lane's 61% two-stack share. Invalid non-empty lands around 7–8.5 µs and an
empty body around 6–7.5 µs after #387. The 422 body, status, and error identity
are untouched; only duplicated diagnostics are removed.

Negative and accepted: an application that reads `error.cause.stack` will see
no frames on V8. The thrown `error.stack` still locates `validatedBy` and the
resolver chain, and the 422 `issues` identify the failing field, so the
practical diagnostic path is intact. The change should be noted in the
`ZodValidationError` TSDoc and the changelog when implemented.

Neutral: on engines without `Error.stackTraceLimit`, the cause keeps a stack.

## Revisit triggers

- An application, resolver, or default integration starts reading
  `cause.stack` for validation diagnostics.
- APM/logging integration begins collecting the cause rather than the thrown
  error.
- `Error.stackTraceLimit` is removed or a target engine reports measurable
  stack-capture cost the toggle cannot avoid.
- A later decision shrinks the error surface (for example, a single error type)
  — supersede this record.

## Notes

- **Measurement provenance:** plan `2026-11-11_PERF_TRIVIAL_CASE_SHORTCUTS.md`
  §3.5 (11.97 → 4.68 µs with both stacks off) and the #387 A/B in
  `BENCHMARKS.md` (binding/validation table). A construction-only cross-check in
  the `tsx` lane measured two errors at 6.07 µs, one error at 3.84 µs, cause
  suppressed at 4.02 µs, and both suppressed at 1.62 µs — the same one-third
  share for the cause stack. Keeping the cause with a suppressed stack costs
  0.18 µs over dropping it entirely, so D-1 retains the structured `issues` at
  essentially the single-error price.
- **On acceptance:** file the implementation issue against
  `@ndigo/dispatcher`. The change is confined to `toConversionError` /
  `validatedBy` plus a V8-guarded test asserting the thrown error has a stack
  and the cause does not.
- **Companions:** [AD-07](2026-09-05_AD07_ZOD_VALIDATION.md) (Zod binding),
  [AD-91](2026-11-02_AD91_1_0_API_FREEZE.md) (error-surface freeze),
  [AD-94](2026-11-06_AD94_ERROR_LINEAGE.md) (error lineage).
