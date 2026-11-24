# AD-116: Error disposition and problem status are data

**Date:** 2026-11-24
**Status:** Accepted
**See also:** AD-10 (RFC 9457 error model), AD-113 (public surface policy)
**Refs:** #747 (this decision)

---

## Context

`ApplicationError` and `FrameworkError` exist but no code consumes the
distinction; the hierarchy's own module notes admitted the strategy was
unfinished. The Node adapter mapped client-facing failures with `instanceof`
inside a platform package, so a second platform had to re-implement the table.
`RequestLimitError` already proved the better pattern: it carried `statusCode`
and `code` as data.

AD-10 had already declared the intended shape: the status table is "the
canonical wiring of the existing-but-unused `ResponseStatuses` vocabulary."
The missing piece was a contract that a platform can read by shape, plus a
registry for the problem-type URIs that lives below the platform.

## Decision

### D-1 — Disposition is data on the error

Every `FrameworkError` and `ApplicationError` carries `disposition`:

- `framework` — the framework failed or is misconfigured (default for
  `FrameworkError`);
- `application` — the application's domain failed (default for
  `ApplicationError`);
- `client` — the request was invalid or unfulfillable; **requires** a
  `problemStatus` and a `problemType` at construction, or the constructor
  throws `TypeError`.

The class lineage says _who threw it_; the disposition says _whose fault it is_
and how loudly to log it. They are deliberately independent: a framework-thrown
404 is a client fault.

### D-2 — `problemStatus`, not `status`

The field is named `problemStatus` because `Response.status` is a number and
`ResponseError implements Response`; a base `status` object would make that
class impossible. The type is structural:

```ts
interface ProblemStatus {
    readonly code: number;
    readonly text?: string;
}
```

`ResponseStatus` satisfies it, so concrete HTTP errors carry the cached value
object and the kernel never depends on `@ndigo/http`. The structural check
`likeClientProblem` is used by every adapter and the last-resort resolver;
`instanceof` is not part of the cross-package contract.

### D-3 — Problem types move to `@ndigo/http`

`ProblemTypes` is HTTP vocabulary: dispatcher, view, and platform-node all need
it, and all three already depend on `@ndigo/http`. It moves there with the
kebab-case slugs (including the transport set: `request-timeout`,
`headers-too-large`, `request-too-large`, `field-too-large`, `file-too-large`,
`too-many-files`, `too-many-fields`, `too-many-parts`, `missing-boundary`,
`malformed-multipart`).

### D-4 — Render by shape, override in the resolver chain

`writeErrorResponse` and `NodeLastResortErrorResolver` read
`disposition`/`problemStatus`/`problemType` structurally. The last resort
honors a client problem before falling back to the 500 document. An application
that wants a different rendering registers an `@errorMapping` handler or a
custom `RouteErrorResolver` before the last resort; the error itself is never
mutated.

### D-5 — Serialize what travels

`toJSON()` carries `disposition` and `problemType`; it does **not** carry
`problemStatus`. The status is a transport-specific rendering hint — a queue
consumer, a gRPC surface, and an HTTP adapter map the same failure differently.

## Behavior changes

HTTP statuses do not change. Limit-error problem documents change in two ways:

1. `type` is kebab-case (`urn:ndigo:request-timeout`), matching AD-10's
   `urn:ndigo:<slug>` convention.
2. `detail` is the human message (`Request body timed out`), per AD-10's
   type/detail split.

The alternative — preserving the snake-case transport codes and slug detail —
was rejected because it keeps two vocabularies for the same field.

## Consequences

- Every client-facing class states its status and problem type once, next to
  the class.
- A second platform adapter renders client errors without importing dispatcher
  or view error classes.
- The `@ndigo/http` error vocabulary is the single registry of problem types;
  the RFC 9457 status table stays in AD-10.
- Errors thrown by applications can opt into client rendering with
  `new ApplicationError(message, { disposition: 'client', problemStatus,
  problemType })`.
