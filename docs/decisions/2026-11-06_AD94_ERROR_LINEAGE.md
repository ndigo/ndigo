# AD-94: Error lineage — `IllegalStateError` for closed-state guards, `FrameworkError`/`ApplicationError` as the package bases

**Date:** 2026-11-06
**Status:** Accepted
**Deciders:** Framework owner (2026-11-06)

---

## Context

`@ndigo/core` ships a small error vocabulary — `ApplicationError` and
`FrameworkError` (both `AsSerializableError(Error)`), with `IllegalStateError`
extending `FrameworkError` — and the repo guidelines already say to prefer
specific error classes over plain `new Error()`. The 2026-11-06
contract-reuse survey found the guideline applied unevenly:

- The closed-state guard idiom (`if (this.#closed) throw new Error('… is
  closed')`) repeated across the infra packages with a generic `Error` in the
  LibSQL job/outbox/session/queue stores, the redis connection/cache/fanout,
  and the node socket-session registry and HTTP server adapter — while the
  redis job-driver/lock-driver/rate-limiter and the in-process jobs backends
  already threw `FrameworkError`.
- Eight domain/service errors extended plain `Error`
  (`StompProtocolError`, `RequestLimitError`, `ZodValidationError`,
  `JWTTokenError`, `OIDCError`, `InvalidCredentialsError`,
  `CircuitOpenError`, `UnknownPasswordSchemeError`) while sibling errors in
  the same packages extended `FrameworkError`.

Plain-`Error` children bypass `AsSerializableError`'s serialization shape
(they render without the framework's `toJSON` form) and give generic
`catch (e is ApplicationError)`-style handlers no seam.

## Decision

### D-1 — Closed-state guards throw `IllegalStateError`

An operation invoked on a closed/disposed/not-yet-ready resource throws
`IllegalStateError` with a byte-identical message string (message text is
unchanged by this decision; several tests and log-matching flows key on it).
The guard-family members that already threw `FrameworkError` stay as they are
— they satisfy a weaker constraint and a bigger migration to
`IllegalStateError` is not scheduled: `FrameworkError` is the base
`IllegalStateError` extends, so handlers catching `FrameworkError` still see
them either way.

### D-2 — Service/domain error bases

Classes representing framework bypass/protocol/transport failures extend
`FrameworkError`; classes representing the application's own domain denials
extend `ApplicationError`:

| Class                     | Base               | Rationale                |
| :------------------------ | :----------------- | :----------------------- |
| `StompProtocolError`      | `FrameworkError`   | wire-protocol failure    |
| `RequestLimitError`       | `FrameworkError`   | pipeline transport limit |
| `ZodValidationError`      | `FrameworkError`   | request-binding failure  |
| `JWTTokenError`           | `FrameworkError`   | token-processing failure |
| `OIDCError`               | `FrameworkError`   | provider-bridge failure  |
| `InvalidCredentialsError` | `ApplicationError` | domain denial            |
| `CircuitOpenError`        | `ApplicationError` | domain fail-fast signal  |

Names, messages, and the explicit `this.name` pins are unchanged —
`instanceof` uses against the concrete classes keep working, because only the
base moves.

### D-3 — Dependency-free contract packages keep plain `Error`

`@ndigo/auth-core` is a zero-`@ndigo`-dependency contract package by design.
`UnknownPasswordSchemeError` stays on plain `Error` rather than pulling
`@ndigo/core` for one class. Future errors in that package follow the same
rule until the package gains a deliberate core dependency.

## Consequences

- Closed-state failures are distinguishable from data errors in handlers and
  in serialized problem documents.
- Packages that extend the shared bases declare `@ndigo/core` as a direct
  dependency (auth-client, auth-server, resilience gained it; socket,
  platform-node, dispatcher already had it).
- Generic `throw new Error(...)` remains appropriate where no core class
  fits yet (invalid input/data-integrity errors — e.g. malformed LibSQL
  records, `PageRequest` validation). A dedicated
  `IllegalArgumentError`-range decision is left open until a third instance
  appears (Rule of Three).
