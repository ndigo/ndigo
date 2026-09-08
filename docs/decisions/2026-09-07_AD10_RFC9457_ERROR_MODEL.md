# AD-10: RFC 9457 problem+json error model for HTTP APIs

**Date:** 2026-09-07
**Status:** Accepted — sequenced implementation (3A → 3B → consistency sweep)

## Background

Blue's Node HTTP surface produces an **inconsistent, custom error envelope**.
Grounded audit of today's response shaping:

| Location | Today's shape | Problem |
| --- | --- | --- |
| `NodeParameterBindingErrorResolver` | `{ "error": "<flattened message>" }` | Custom; machine data unavailable |
| `node-http-server-adapter` (#writeJson) | `{ "error": code }` **and** `{ "error": "Not Found" }` mixed | Custom; code-vs-message ambiguity |
| `note-controller` / `drizzle-note-controller` (5 sites) | `ResponseEntity.badRequest({ error: 'Unauthorized' })` | **Wrong status** — auth failure is 401 not 400 (RFC 9110 §15.5.2) |
| `auth-controller` | 400 `{ error: 'Invalid credentials' }`; comment claims 401 | Same status error |
| `static-file-view`, `static-controller`, `csrf-interceptor` | `{ error: 'Forbidden'/'Not Found'/'…' }` | Custom; unnegotiated |
| Method-mismatch (POST to GET-only route) | Falls through to 404 | Should be **405 + `Allow`** (RFC 9110 §15.5.6) |
| Unresolved server error | 500/empty via `TypeError('view name is undefined')` | No default last-resort handler |
| `ParameterConversionError` (Phase 4A) | `{ error }` body; structured `issues` in the `cause` | Structure unused at the wire |

The framework's own `ResponseStatuses` **already models 401/405/406/413/415/422/429/503** but
they are wired nowhere on the response path. The HTTP vocabulary audit in
this AD (see below) found the status/reason-phrase set essentially correct
(the one stale reference is `response-status.ts`'s `@see rfc2616`, obsolete
since 7230/9110).

## Decision

**The Node HTTP API error contract is RFC 9457 — "Problem Details for HTTP APIs"**
(which **obsoletes RFC 7807**). Adoption items:

1. **Envelope:** all 4xx/5xx responses body is `application/problem+json`
   carrying the standard members `type`, `title`, `status`, `detail`,
   `instance`, plus `errors` as a registered extension member for per-field
   validation failures (RFC 9457 allows extension members).
2. **Problem-type URI:** **`urn:blue:<slug>`** — for example
   `urn:blue:validation-failed`. This is a **placeholder scheme** chosen for
   self-containment (no DNS obligation, no doc fetch); before any public
   release, register real HTTPS problem-type URIs
   (`https://<domain>/problems/<slug>`) at a discoverable location and update
   the resolver's default. **Tracked as implementation TODO; not a blocker**
   — no external consumers exist to migrate or notify (development mode).
3. **Always problem+json for errors:** no conneg/Accept negotiation yet —
   error responses unconditionally use `application/problem+json`. (No real
   consumers to migrate; revisit negotiation only if a legacy-client
   requirement emerges.)
4. **Status conventions (the "error type → status" table):**
   - 400 — transport/binding failures (malformed URL, malformed body,
     missing parameter, conversion failure)
   - 401 — missing/invalid credentials **+ `WWW-Authenticate` header**
   - 403 — insufficient role
   - 404 — no route, no resource, no view
   - 405 — method not allowed **+ `Allow` header**
   - 406 — not acceptable (unfulfillable `Accept`)
   - 413 — payload too large (already deterministic in the adapter)
   - 415 — unsupported media type
   - 422 — **schema validation failure** (Zod issues from `validatedBy`);
     400 stays reserved for syntax/binding
   - 429 — rate limited
   - 503 — service unavailable
   - 500 — anything else (unhandled), **never leaking internals**
   This table is the canonical wiring of the existing-but-unused
   `ResponseStatuses` vocabulary.
5. **`type`/`detail` split:** `type` is the machine code (the
   `urn:blue:<slug>`); `detail` is the human-readable message. Today's
   `{ error: code }` vs `{ error: message }` ambiguity disappears.

## Versions

| Artifact | Status |
| --- | --- |
| RFC 9457 | Proposed standard (2025-08); obsoletes 7807 |
| RFC 9110 | HTTP Semantics (auth, 401/405, `Allow`, `WWW-Authenticate`) |
| RFC 9111 | HTTP Caching (`Cache-Control` on errors) |
| `ResponseStatuses` (blue-http) | 63 codes incl. 103/208/226/418/421/422/425/428/429/431/451/506–511 — audit-verified reasons |

## Consequences

**Behavior changes (client-visible, pre-1.0 — accepted):**

- All 4xx/5xx bodies change shape from `{ error }` to the problem document.
- `POST /notes`/`POST /drizzle/notes` with invalid body: currently 400
  `{ error }` → **422 problem document** with `errors[]` (Phase 4A issues).
- Auth failures (all 5 controller sites + `auth-controller`) change from 400
  to **401**, and add `WWW-Authenticate`. `AuthRouteGuard` already emits
  401/403 correctly — controllers align to it.
- Method-mismatch on an existing path returns **405 + `Allow`** instead of 404.
- Errors become **negotiation-ready**: `Vary: Accept` on error responses,
  `Accept-Language` → localized `title`/`detail` (via existing
  `LanguageResolver` + `ContentSource`), `instance` wired to the
  `CryptoRequestIdCorrelation` request id (or `urn:uuid:<id>`),
  `Cache-Control: no-store` on error responses.

**Framework surface added:**

- `problem+json` media type + `ProblemDetails` type (`type`, `title`,
  `status`, `detail`, `instance`, `errors`).
- **Last-resort error filter** in the Node pipeline: any error not handled by
  the `RouteErrorResolver` chain produces a deterministic problem document
  (500 default) instead of the current 500/empty `TypeError` path.
- `ValidationIssue[]` (Phase 4A) rendered into `detail` + `errors`.

**Not changed (deliberately):**

- `RouteErrorResolver` / `MetadataErrorResolver` / `@errorMapping` contract —
  the resolution chain stays; the filter is the last link.
- Success responses stay `application/json` — only the error path is
  problem+json.
- The adapter's "log internals, never return them" behavior — retained
  (RFC 9457 alignment: `detail` never leaks stack/table/class names).

## HTTP vocabulary audit (the "types/enums up to date" workstream)

The audit target is everything in `@blue/http` (and `@blue/core` where shared)
that models the HTTP layer: `ResponseStatuses`, `HTTPHeader`/`HTTPHeaders`,
`MediaType`, quality factors, and any RFC citations.

| Item | Action |
| --- | --- |
| `ResponseStatus` `@see rfc2616` | Update to RFC 9110 (2616 is obsolete) |
| Reason phrases | Spot-verified correct (413 Payload Too Large, 422 Unprocessable Entity, 425 Too Early, 429, 431, 451, 506–511) — add a regression test locking reasons/phrases against the RFC table |
| Header names present | `WWW_AUTHENTICATE`, `ALLOW`, `VARY`, `CACHE_CONTROL`, `CONTENT_TYPE`, `ACCEPT_CH`, `ACCEPT_RANGES` — audit for missing modern headers (e.g. `Retry-After`, `Alt-Svc`, `Digest`, `Reporting-Endpoints`), add the ones we emit |
| Status-set gaps | `PAYMENT_REQUIRED`(402) present but unused — deliberate (reserved); document rather than wire |
| Content negotiation | `quality-factor`, `MediaType`, `ContentNegotiationViewResolver` exist — reuse for error negotiation later (3B+); no new machinery |

## Sequencing

**3A — Correctness (no body-contract change yet):**

1. Last-resort error filter in the Node pipeline (deterministic 500 + JSON
   instead of 500/empty).
2. Status conventions: 405 + `Allow` (method mismatch), 406/415/422/429/503
   wired to the existing `ResponseStatuses`.
3. Auth fix: 401 + `WWW-Authenticate` in the 5 controller sites and
   `auth-controller`.
4. HTTP vocabulary audit deltas that are pure fixes (RFC citations, reason
   phrase regression test).

**3B — The RFC 9457 envelope:**

5. `ProblemDetails` type + `application/problem+json` writing.
6. `NodeParameterBindingErrorResolver` renders `issues` (Phase 4A) → `detail`
   + `errors`; validation failures → 422.
7. `instance` ← request-id correlation; `Cache-Control: no-store` on errors;
   `Vary: Accept`; `Accept-Language` → localized `detail` where resolvable.
8. Adapter/static/CSRF/CORS error bodies migrate onto the envelope.

**Consistency sweep:**

9. Update every test asserting the old `{ error }` shape (~30 sites).
10. `urn:blue:*` → real HTTPS problem-type URIs **before first public
   release** (placeholder scheme is tracked here).

**AD-10 implementation tracked in docs/plans/ (see the error-model plan).**

## Revisit Trigger

Revisit if (a) a real external consumer needs legacy `{ error }`
compatibility (add `Accept`-based negotiation + `Vary: Accept`), (b) a
standardized problem-type registry (e.g. IANA) gains normative force
(migrate `urn:blue:*` URIs), or (c) a requirement emerges that the problem
document cannot express (extend with a new registered member, not a fork).