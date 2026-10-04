# 2026-10-04 Resilience: Retry and Circuit Breaking on `@blue/proxy`

Decision record: [AD-43](../decisions/2026-10-04_AD43_RETRY_AND_CIRCUIT_BREAKER.md)

## 1. Problem

Service clients (`@blue/service`, `serviceClient(target, http)`) have no
resilience: a network failure or a downstream outage fails the call and every
subsequent call immediately. There is no retry, backoff, or circuit breaking,
and no way to attach such policy without editing the client.

`@blue/proxy` (AD-42) now provides container-managed method interception with
an interceptor chain. The chain's `next()` was made re-entrant (2026-10-04,
plan D-3 amendment) specifically on the evidence that around-advice needs to
re-invoke the join point — the retry pattern. This plan consumes that contract.

## 2. Current state (verified 2026-10-04)

- `serviceClient(target, http)` returns a get-trap proxy dispatching
  `@service`-declared methods to HTTP calls
  (`packages/blue-service/src/service-client.ts:196-253`). One in-repo
  consumer: `apps/blue-island/client/main.ts:68`
  (`serviceClient(IslandPushAPI, new HTTP())`).
- `@blue/proxy` exports `methodAnnotation`/`annotationOf`, `MethodInterceptor`
  (`matches`/`invoke(invocation, next)`/`order`), `invokeChain` (re-entrant
  `next()`), `weaveMethodProxy` + `MethodChainSpec`, and
  `interception([...])` (`InitializationAwareProcessor`).
- Chain weaving knowledge (per-instance descriptor enumeration + matching)
  currently lives inside `interception()`'s processor
  (`packages/blue-proxy/src/processor.ts` `buildSpecs`); it is not exposed
  for standalone (container-free) weaving.
- No resilience utility exists anywhere in the repo (no retry/backoff/circuit
  breaker implementation).

## 3. Decisions

| #                                                                      | Decision                                                                                                                                                                                                                                                | Rationale                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1                                                                    | New isomorphic package `@blue/resilience` owning policy interceptors + backoff policies                                                                                                                                                                 | Policy, not mechanism: `@blue/proxy` stays interception-only. Depends on `@blue/proxy`; usable from browser and node (service clients are client-side).                                                                                                                               |
| D-2                                                                    | Annotation-driven selection: `@retry({...})` / `@circuitBreaker({...})` keys on the service interface/class methods, standard `methodAnnotation` pattern                                                                                                | Metadata is the selection contract, consistent with `@audited` (AD-42 D-2). Interceptors `matches()` on their own key.                                                                                                                                                                |
| D-3                                                                    | Retry: `attempts` (default 3), `backoff` policy, optional `retryable(error)` predicate; final error re-thrown after exhaustion                                                                                                                          | No implicit promise machinery — `invoke` awaits `next()` itself (AD-42 D-3: async is the interceptor's responsibility). `retryable` default: retry all thrown errors; **idempotency is the caller's contract** — a non-idempotent call must pass a restrictive predicate, documented. |
| D-4                                                                    | Backoff policies are plain functions/interfaces: `fixedBackoff(ms)` and `exponentialBackoff({initialMs, factor?, maxMs?})` returning `delay(attempt): number`                                                                                           | "No expression language" precedent (caching D-5: plain JS functions). Testable with injected policies.                                                                                                                                                                                |
| D-5                                                                    | Circuit breaker: per (entryName, methodName) cell; `failureThreshold` consecutive failures → OPEN, then fail-fast `CircuitOpenError`; after `resetMs` the next call probes (HALF-OPEN); success closes and resets counters, failure re-opens            | Per-method granularity matches descriptors. No time-window edge cases beyond reset (keep semantics minimal and explicit).                                                                                                                                                             |
| D-6                                                                    | Standalone weaving: `@blue/proxy` gains `interceptMethods(instance, interceptors)`, extracting `buildSpecs` from the processor                                                                                                                          | Service clients are not factory entries — container processors (`interception(...)`) cannot see them. `serviceClient(target, http)` keeps its signature (no blue-service churn).                                                                                                      |
| D-7                                                                    | Demo gate: service-client composition spec in `@blue/service` on the real thrown failure (response-schema `IllegalStateError`);                                                                                                                         |
| blue-island stream calls deferred (verified: generators return at call |
| time)                                                                  | Real consumer shape, exercised where the interceptor contract                                                                                                                                                                                           |
| actually fires                                                         |
| D-8                                                                    | Non-goals: response-classification heuristics (HTTP status → retryable), time-window sliding metrics, half-open probes beyond the single attempt, per-request budget sharing, transport `ResponseError`-value classification, stream-iteration failures | Keep v1 semantics explicit; revisit on real consumer evidence (AD-42's approach for scope)                                                                                                                                                                                            |

## 4. Architecture

### Package

`packages/blue-resilience/` — mirrored from the `blue-proxy` skeleton
(package.json, tsconfigs, exports). Depends on `@blue/proxy` only.

### API sketch

```ts
// Policy declaration on the service interface/class:
@service('push', { baseUrl: '/api' })
class IslandPushAPI {
    @retry({ attempts: 3, backoff: exponentialBackoff({ initialMs: 100, factor: 2 }) })
    @circuitBreaker({ failureThreshold: 5, resetMs: 10_000 })
    push(payload: PushPayload): Promise<void> {}
}

// Wiring at the client site (D-6):
const api = interceptMethods(serviceClient(IslandPushAPI, new HTTP()), [
    new CircuitBreakerInterceptor(),
    new RetryInterceptor(),
]);
```

- `interceptMethods(instance, interceptors)` — enumerates prototype methods
  (shared `enumeratePrototypeMethods`), builds descriptors, runs `matches()`,
  delegates to `weaveMethodProxy`. Returns the instance unchanged when
  nothing matches (same no-proxy guard as the processor).
- `RetryInterceptor` runs outside `CircuitBreakerInterceptor` (CB short-circuits
  before retry burns attempts).
- Both interceptors are stateless per call; CB keeps per-cell state keyed by
  `entryName + methodName` on the interceptor instance (one instance per
  client).

## 5. Risks

| Risk                                                                      | Mitigation                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Re-entrant `next()` re-executes side effects on retry                     | Documented: `retryable` predicate is the caller's idempotency contract (D-3)                                                                                                                                                                   |
| Async timing: `invoke` awaiting `next()` changes downstream advice's view | `next()` result is a promise only when the tail/interceptors return one; retry interceptor awaits — outer interceptors already model async results as values (AD-42 D-3)                                                                       |
| CB state shared across client instances                                   | State keyed on the interceptor instance; one interceptor per client (D-5)                                                                                                                                                                      |
| Sleep-based backoff slows tests                                           | Policies are injected → fake policies in specs; only the policy itself computes delays                                                                                                                                                         |
| `interceptMethods` diverges from processor matching                       | Single shared `buildSpecs` extraction (D-6), spec-asserted for both paths                                                                                                                                                                      |
| Callers expect transport failures to retry                                | Verified (2026-10-04): `HTTP.request` resolves with `ResponseError` values — it never throws. v1 interceptors stay in the exception path; classified transport values stay out of v1 (D-8) — a future consumer classifies at the call boundary |

## 6. Sequencing

### Phase 0 — Package scaffold

- `packages/blue-resilience` skeleton + workspace wiring + manifest check.
- **Acceptance:** `pnpm --filter @blue/resilience test` green; `manifest:check` clean.

### Phase 1 — Backoff policies + RetryInterceptor

- `BackoffPolicy` interface, `fixedBackoff`, `exponentialBackoff`; `@retry`
  annotation key; `RetryInterceptor` (re-entrant `next()` per call, awaits,
  exhaustion re-throws final error).
- Specs: attempt counts, delay sequence from injected policy, retryable
  predicate, exhaustion error identity, promise success path.
- **Acceptance:** Phase 1 specs green.

### Phase 2 — CircuitBreakerInterceptor

- `@circuitBreaker` key; OPEN/CLOSED/HALF-OPEN per cell; fail-fast error;
  probe recovery; counters reset on close.
- Specs: threshold → open; open fast-fails (no tail); reset → probe once →
  recovery; failure during probe → re-open; per-method isolation.
- **Acceptance:** Phase 2 specs green.

### Phase 3 — `interceptMethods` in `@blue/proxy`

- Extract `buildSpecs` (descriptor enumeration + matching) into `weave.ts`;
  public `interceptMethods(instance, interceptors)`; processor reuses the
  extraction; `processAfterInitialization` behavior unchanged.
- Specs: standalone weave matches/intercepts; no-proxy guard; processor
  suite still green (unchanged behavior).
- **Acceptance:** blue-proxy suite green including processor especs.

### Phase 4 — Demo gate (service-client composition)

- Gate spec `packages/blue-service/test/service-client-resilience.spec.ts`:
  the exact composition a real app uses —
  `interceptMethods(serviceClient(API, http), [circuit, retry])` — exercised
  on the service layer's real thrown failure: response-schema validation
  raises `IllegalStateError`.
  (blue-island adoption is deferred: its only call is a stream, and stream
  calls return their generator at call time — failures surface during
  iteration, outside v1's call-level scope. Verified 2026-10-04.)
- **Acceptance:** `pnpm --filter @blue/service test` green including the gate.

### Phase 5 — Verification and docs

- Full `pnpm test`, `pnpm lint` (changed files), `pnpm format`, manifest
  check; `graft build`; ADR amended with verified transport/stream/proxy
  surface findings.
- **Acceptance:** workspace green; docs final.

## 7. Verification

- Per-phase acceptance above; fake-clock/fake-policy specs keep Phase 1-2
  deterministic; Phase 4 exercises the real consumer path.
