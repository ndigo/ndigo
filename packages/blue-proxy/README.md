# @blue/proxy

Optional container-managed method interception for BlueJS, built on the native
JavaScript `Proxy`.

- **Annotations** — metadata-only decorators that describe a method without
  replacing it (`methodAnnotation`).
- **Interceptors** — `matches()` / `invoke(invocation, next)` contract with
  explicit ordering.
- **Weaving** — one `Proxy` per advised entry, target-bound receivers, cached
  method wrappers, no proxy when nothing matches.

Design and rationale: [AD-42](../../docs/decisions/2026-10-03_AD42_METHOD_INTERCEPTION.md),
implementation plan: [2026-10-03_METHOD_INTERCEPTION](../../docs/plans/2026-10-03_METHOD_INTERCEPTION.md).
