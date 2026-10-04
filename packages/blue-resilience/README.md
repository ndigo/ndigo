# @blue/resilience

Retry, circuit breaking, and backoff policies for BlueJS — policy interceptors
built on the `@blue/proxy` interception contract (AD-42).

- **`@retry`** — annotation-driven retry with injected backoff policies
  (`fixedBackoff`, `exponentialBackoff`) and a `retryable(error)` predicate.
- **`@circuitBreaker`** — per (entry, method) circuit state: fail-fast,
  reset window, single-attempt probe recovery.

Design and rationale: [AD-43](../../docs/decisions/2026-10-04_AD43_RETRY_AND_CIRCUIT_BREAKER.md),
implementation plan:
[2026-10-04_RETRY_AND_CIRCUIT_BREAKER](../../docs/plans/2026-10-04_RETRY_AND_CIRCUIT_BREAKER.md).
