# Guide 08 — Errors & Problem Details

Every Ndigo HTTP failure has a shape. Transport, binding, validation, auth, and
handler failures all converge on an RFC 9457 `application/problem+json`
document, and the dispatcher's resolver chain decides which handler or view
turns a thrown error into that document. This guide covers the contract, the
extension points, and the places where a domain app deliberately overrides the
default envelope.

**Audience:** Node and browser application developers · **Prerequisites:** Guides 01 and 07 · **Reference app:** `apps/05-ndigo-api`, `apps/11-ndigo-conduit-api`

## What you'll learn

- Read and produce the RFC 9457 problem document.
- Choose the right base class for a domain error.
- Register a class-wide or method-level `@errorMapping` handler.
- Add a custom `RouteErrorResolver` to the platform chain.
- Map validation issues and auth denials to the right status.
- Replace the default envelope when a protocol requires it.

## 1. The contract

A problem document has `type`, `title`, `status`, `detail`, `instance`, and the
Ndigo `errors[]` extension for field-level validation issues:

```json
{
    "type": "urn:ndigo:validation-failed",
    "title": "Unprocessable Content",
    "status": 422,
    "instance": "/api/notes",
    "errors": [{ "path": ["title"], "message": "Required" }]
}
```

The status mapping is deterministic:

| Condition                                              | Status                       |
| ------------------------------------------------------ | ---------------------------- |
| Malformed URL/body, missing or unconvertible parameter | 400                          |
| Missing/invalid credentials                            | 401 + `WWW-Authenticate`     |
| Insufficient role                                      | 403                          |
| No route or no view                                    | 404                          |
| Path exists, method not allowed                        | 405 + `Allow`                |
| Zod validation failure                                 | 422 + `errors[]`             |
| Unacceptable representation                            | 406                          |
| Anything unhandled                                     | 500 (internals never leaked) |

`ProblemTypes` in `@ndigo/platform-node` holds the `urn:ndigo:*` slugs. They are
placeholders; replace them with real HTTPS URIs before a public release.

## 2. Error lineage

Ndigo's error vocabulary is small and deliberate:

- `ApplicationError` — an application/domain denial (the request was understood
  but refused). Extend it for your own domain errors.
- `FrameworkError` — a framework or transport failure. Extend it only for
  framework-level bypass/protocol errors.
- `IllegalStateError` — a closed/disposed/not-ready guard; extends
  `FrameworkError`.

Both bases are serializable, so the error shape survives the response boundary.
Do not throw bare `new Error()` for conditions the framework or an application
handler is expected to catch: a plain error bypasses the serialization shape and
gives `catch (e instanceof ApplicationError)` handlers no seam.

```ts
import { ApplicationError } from '@ndigo/core';

export class ArticleForbiddenError extends ApplicationError {
    constructor(readonly articleId: string) {
        super(`Article ${articleId} is not editable by this account`);
    }
}
```

## 3. The resolver chain

The Node platform registers an ordered chain when the app does not override
`errorResolvers`:

1. `NodeParameterBindingErrorResolver` — binding/conversion failures → 400,
   Zod failures → 422.
2. `MetadataErrorResolver` — `@errorMapping` handlers on the failing handler
   or on a registered `@errorHandler` bean.
3. `NodeLastResortErrorResolver` — anything left → 500 (or a known framework
   error → its status).

The first resolver that returns a `ModelAndView` wins; `null` continues the
chain. Apps can replace or prepend entries:

```ts
@entry()
errorResolvers() {
    return [
        new MyDomainErrorResolver(),
        new NodeParameterBindingErrorResolver(),
        new MetadataErrorResolver(),
        new NodeLastResortErrorResolver(),
    ];
}
```

Order matters: a broad resolver before a specific one masks it. Keep the
binding resolver early so 400/422 semantics stay consistent.

## 4. `@errorHandler` and `@errorMapping`

A class-wide handler is a bean marked `@errorHandler`; each method declares the
error classes it owns with `@errorMapping`:

```ts
import { errorHandler, errorMapping, ModelAndView, type RouteHandlerMethod } from '@ndigo/dispatcher';
import type { Route } from '@ndigo/router';

@errorHandler
class ApiErrorHandler {
    @errorMapping(ArticleForbiddenError)
    forbidden(route: Route, error: Error, handlerMethod: RouteHandlerMethod) {
        return new ModelAndView(new ForbiddenView((error as ArticleForbiddenError).articleId));
    }
}
```

The method signature is `(route, error, handlerMethod)` and the return is a
`ModelAndView` (or `null` to continue). A method-level mapping on the failing
controller is checked first, then beans marked `@errorHandler`; the most
specific error class wins. Register the handler as an `@entry` bean so the
metadata resolver can find it.

## 5. A custom resolver

For an envelope that is not problem+json, extend `AbstractRouteErrorResolver`
and return a view that writes the exact body:

```ts
import { AbstractRouteErrorResolver, ModelAndView } from '@ndigo/dispatcher';

class DomainErrorResolver extends AbstractRouteErrorResolver {
    protected _resolveError(route: Route, handler: object | null, error: Error) {
        if (!(error instanceof ArticleForbiddenError)) return null;
        return new ModelAndView(new DomainErrorView(403, error.message));
    }
}
```

`DomainErrorView` implements `ProducerView` and returns
`{ status, headers, body }`; guide 09 shows the view contract. This is the
pattern the Conduit app uses for the RealWorld `{ errors: { field: [...] } }`
envelope: the resolver translates the framework failure before the last-resort
chain sees it.

## 6. Validation and auth

Two failure families deserve their own shape:

- **Validation** — `ZodValidationError` carries `ValidationIssue[]`
  (`path`, `message`). The binding resolver answers 422 with `errors[]`. If an
  app expects a different envelope, translate the issues in the first resolver.
- **Auth** — `AuthRouteGuard` denials are `401`/`403` problem documents; a
  handler can also return a `ResponseEntity<ProblemDetails>` directly. Keep
  `WWW-Authenticate` on 401 and `Allow` on 405.

A handler that wants full control over a success/failure response returns
`new ResponseEntity(body, status, headers)`. The `ResponseEntityView` rewrites
any `>= 400` entity into problem+json, so a protocol-specific envelope must be a
`ProducerView` (as above), not a `ResponseEntity`.

## 7. Pitfalls

- **Do not leak internals in 500s.** The last-resort resolver deliberately
  replaces the message; log the error with its trace id instead.
- **Use `ApplicationError` for domain denials.** A plain `Error` skips the
  serializable shape and the catch-by-base-class seam.
- **Order resolvers from specific to broad.** A catch-all first hides every
  later resolver.
- **Do not return a `ResponseEntity` for a custom envelope.** It is rewritten
  to problem+json.
- **Keep `detail` for humans and `errors[]` for machines.** Do not encode
  field paths in `title`.
- **406 is not 404.** The route resolved; only the representation is
  unacceptable.

## See also

- [Guide 01 — Building a Node API](01-building-a-node-api.md) — the end-to-end error section
- [Guide 05 — Routing & Route Conditions](05-routing-and-route-conditions.md) — 404/405 routing behavior
- [Guide 07 — Request Validation](07-request-validation.md) — the 422 document
- [Guide 09 — Views, Targets & Content Negotiation](09-views-and-content-negotiation.md) — `ProducerView` and 406
- [AD-10](../decisions/2026-09-07_AD10_RFC9457_ERROR_MODEL.md) and [AD-94](../decisions/2026-11-06_AD94_ERROR_LINEAGE.md) — the error model and lineage
