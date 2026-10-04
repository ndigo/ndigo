# AD-43: Retry and circuit breaking on `@blue/proxy` — `@blue/resilience`

**Date:** 2026-10-04
**Status:** Accepted — design and implementation plan:
[2026-10-04_RETRY_AND_CIRCUIT_BREAKER](../plans/2026-10-04_RETRY_AND_CIRCUIT_BREAKER.md)

## Context

Service clients (`@blue/service`/`serviceClient`) have no resilience: network
and downstream failures fail the call and every subsequent call. There is no
retry, backoff, or circuit breaking, and no way to attach policy without
editing the client.

The proxy interception contract (AD-42) was amended on the evidence of this
consumer: `next()` is re-entrant (single-call guard removed 2026-10-04) so
around-advice can re-invoke the join point — the retry pattern. This ADR
secures the first policy consumer of `@blue/proxy`.

## Evidence

- `serviceClient(target, http)` returns a get-trap proxy dispatching
  `@service`-declared methods to HTTP
  (`packages/blue-service/src/service-client.ts:196-253`); one in-repo
  consumer exists (`apps/blue-island/client/main.ts:68`).
- `@blue/proxy` ships `methodAnnotation`, `MethodInterceptor`,
  `invokeChain` (re-entrant), `weaveMethodProxy`, `interception([...])`
  (container processor).
- Container processors cannot weave service clients (they are not factory
  entries), so standalone weaving (`interceptMethods`) is required — the
  descriptor-enumeration logic already exists inside the processor
  (`processor.ts` `buildSpecs`) and is a shared extraction, not new design.
- No retry/backoff/circuit-breaker utility exists anywhere in the repo.

## Decision

| #   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                            | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1 | New isomorphic package `@blue/resilience` (retry + circuit breaker + backoff)                                                                                                                                                                                                                                                                                                                                                       | Policy, not mechanism; `@blue/proxy` stays interception-only. Client-side usable (browser + node).                                                                                                                                                                                                                                                                                                                                                            |
| D-2 | Annotation-driven selection: `@retry` / `@circuitBreaker` keys via `methodAnnotation`                                                                                                                                                                                                                                                                                                                                               | Same metadata-selection contract as `@audited` (AD-42 D-2).                                                                                                                                                                                                                                                                                                                                                                                                   |
| D-3 | Retry with `attempts` (default 3), injected `BackoffPolicy`, optional `retryable(error)` predicate; final error re-thrown. **Idempotency is the caller's contract** — non-idempotent calls must restrict `retryable`                                                                                                                                                                                                                | No response-classification heuristics; no implicit request duplication guarantees. Spring `proceed()` precedent for re-invocable next(). **Verified boundary (2026-10-04):** `HTTP.request` never throws — transport failures resolve as `ResponseError` _values_ — so the exception-path interceptors only see errors callers actually throw (e.g. the service layer's response-schema `IllegalStateError`). Transport-value classification stays out of v1. |
| D-4 | Backoff policies are plain functions: `fixedBackoff(ms)` / `exponentialBackoff({...})` returning `delay(attempt)`                                                                                                                                                                                                                                                                                                                   | "No expression language" precedent (caching AD-24 D-5); injectable → deterministic tests.                                                                                                                                                                                                                                                                                                                                                                     |
| D-5 | Circuit breaker per (entry, method) cell: `failureThreshold` consecutive failures → OPEN (fail-fast `CircuitOpenError`); after `resetMs` one probe attempt; success closes, failure re-opens                                                                                                                                                                                                                                        | Minimal explicit state machine; no windowing metrics in v1.                                                                                                                                                                                                                                                                                                                                                                                                   |
| D-6 | `interceptMethods(instance, interceptors)` added to `@blue/proxy` (shared `buildSpecs` extraction); `serviceClient` signature unchanged                                                                                                                                                                                                                                                                                             | Service clients are not factory entries; container-free weaving must be public. **Verified mechanics (2026-10-04):** class-targeted proxies (service clients) are function-typed — weaving enumerates the class `.prototype` surface and reads annotations through the class; descriptor annotation lookup is targetType-based.                                                                                                                               |
| D-7 | Demo gate: `serviceClient` composition spec in `@blue/service` exercising the real failure throw — response-schema validation (`IllegalStateError`)                                                                                                                                                                                                                                                                                 | blue-island adoption deferred: its only `serviceClient` call is a stream (`modelUpdates`), and stream calls return their generator at call time — failures surface during iteration, outside v1 call-level interception. Revisit: first non-stream service-client consumer.                                                                                                                                                                                   |
| D-8 | Non-goals: HTTP-status-based retryability, sliding time windows, multi-attempt probes, budget sharing across requests, and — verified — transport `ResponseError`-value classification and stream-iteration failures. Transport-level retry _already exists_ in `@blue/http` (`retryLimit`, `Retry-After`, `retryStatusCodes` — `interceptors/retry-interceptor.ts`); `@blue/resilience` owns the call boundary and the two compose | Defer on evidence, per AD-42's scope discipline.                                                                                                                                                                                                                                                                                                                                                                                                              |

## Consequences

- Service clients gain opt-in retry + circuit breaking without blue-service
  API changes.
- `next()` re-entrancy is an exercised, documented contract of `@blue/proxy`
  (AD-42 D-3 amendment) — accidental double-execution is the caller's bug
  class, same risk profile as Spring's re-invocable `proceed()`.
- `@blue/proxy` grows one public function (`interceptMethods`); container
  processor behavior is unchanged (shared extraction, regression-covered).
- Retry of non-idempotent calls is possible but explicit and documented —
  no silent double-submit protection.

## References

- Plan: `docs/plans/2026-10-04_RETRY_AND_CIRCUIT_BREAKER.md`
- Interception: [AD-42](2026-10-03_AD42_METHOD_INTERCEPTION.md) (D-3 re-entrancy)
- Service client: `packages/blue-service/src/service-client.ts` (AD-8)
- Consumer: `apps/blue-island/client/main.ts`
