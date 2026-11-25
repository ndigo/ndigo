# Guide 40 — Troubleshooting & FAQ

Most Ndigo failures are deterministic: a missing mapping, an unbindable
parameter, a view name that does not resolve, a proxy that hides the client, or
a stale build. This guide is the symptom → cause → fix index. Start with the
status code or the error class, then follow the link into the owning guide.

**Use for:** diagnosing failures by symptom, status code, or error class.

**Not for:** learning a subsystem; follow the linked owning guide for depth.

**Audience:** Node and browser application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) or [Guide 02](02-building-a-browser-app.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api), [apps/09-ndigo-httpbin](https://github.com/ndigo/ndigo/tree/main/apps/09-ndigo-httpbin)

## What you'll learn

- Diagnose 404, 405, 400, 422, 406, 415, 403, and 429 responses.
- Fix the common DI, view, SSE, migration, and build failures.
- Know which log, manifest, or command answers the question fastest.
- Avoid the traps that look like framework bugs but are configuration.

## 1. HTTP status map

| Symptom                       | Likely cause                                                               | Fix                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **404** on a path you mapped  | Wrong prefix/pattern, class-level mapping missing, trailing-slash mismatch | Check the class + method mapping composition; use `ndigo routes` to list the table ([Guide 05](05-routing-and-route-conditions.md))              |
| **404** after the handler ran | View name did not resolve                                                  | Check the resolver chain and the view name ([Guide 09](09-views-and-content-negotiation.md))                                                     |
| **405** with `Allow`          | Path matched, method did not                                               | Add the verb decorator or accept the method; OPTIONS is handled separately ([Guide 05](05-routing-and-route-conditions.md))                      |
| **400**                       | Missing/unconvertible parameter or malformed body                          | Check the `@parameters` name/type; read the `MissingParameterError`/`ParameterConversionError` message ([Guide 06](06-argument-binding.md))      |
| **422** with `errors[]`       | Zod validation failed                                                      | Read the field paths/messages; fix the schema or input ([Guide 07](07-request-validation.md))                                                    |
| **406**                       | Candidates exist but none serves `Accept`/extension                        | Add a representation or widen the accepted media type ([Guide 09](09-views-and-content-negotiation.md))                                          |
| **415**                       | Wrong `Content-Type` (e.g., login is JSON-only)                            | Send the expected content type; do not form-post JSON endpoints ([Guide 26](26-authentication-and-sessions.md))                                  |
| **403** on a mutation         | CSRF token/cookie mismatch, or missing role                                | Send `X-CSRF-Token` matching the cookie; check the auth metadata (guides [26](26-authentication-and-sessions.md)/[28](28-security-hardening.md)) |
| **429** with `Retry-After`    | Rate-limit budget exhausted                                                | Wait for the window, raise the budget, or fix the client key ([Guide 28](28-security-hardening.md))                                              |
| **500**                       | Unhandled error or misconfiguration                                        | Read the server log with the trace/request id; the body is deliberately sanitized ([Guide 08](08-errors-and-problem-details.md))                 |

## 2. Routing and binding

**“No handler found” for a path that exists in the browser.** The Node
dispatcher uses a radix tree; check the class-level `@requestMapping` prefix and
the method path, and remember that `{*rest}` must be last. `ndigo routes`
prints the registered table.

**A query/matrix condition never matches.** Conditions are ANDed and exact
about the expression syntax (`name`, `name=value`, `!name`, `name!=value`).
Check the query string is URL-encoded and the route is the one you think.

**A required parameter is always missing.** The extractor name must match the
wire name (`queryValue('page')` reads `page`, not `Page`), and a whole-source
binding (`dataBinderValue('body')`) is a different source from a named one.
Missing values become 400; see [Guide 06](06-argument-binding.md).

**Validation returns 422 instead of re-rendering my form.** `validatedBy` /
`validatedBody` are API semantics; parse explicitly with `safeParse` for HTML
forms ([Guide 18](18-forms-end-to-end.md)).

## 3. DI and lifecycle

| Symptom                                 | Cause                                                                          | Fix                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `No value registered` / undefined entry | Entry not registered, wrong name/token, or child context without parent lookup | Register in the config class; resolve after `refresh`; use the token ([Guide 04](04-dependency-injection-and-lifecycle.md)) |
| Circular dependency at refresh          | Constructor/field cycle                                                        | Break with a provider method, setter/aware callback, or a separate collaborator                                             |
| `init` never ran                        | Entry not context-managed (manually constructed, `setValue` instance)          | Register via `@entry`; aware/init hooks only run on container-created entries                                               |
| `destroy` not called                    | Entry is prototype-scoped or not registered                                    | Use a singleton/refresh scope; implement `Destroyable` and let `context.close` run                                          |
| Old config after refresh                | Holding a reference to a destroyed `@refreshScope` entry                       | Resolve again after `config:refresh`; do not cache the instance                                                             |

`context.close` is synchronous; async cleanup must be drained before it or
bridged to `Destroyable` ([Guide 21](21-persistence-and-shared-stores.md)).

## 4. Views, SSE, and the browser

- **“View not found”** — the resolver chain did not produce a view for that
  name. Check the name, the resolver order, and whether the package's view
  module is imported ([Guide 09](09-views-and-content-negotiation.md)).
- **JSON returned for a view name** — a plain `string` return is a JSON value,
  not a view name. Wrap it in `new ModelAndView('name')`.
- **SSE arrives all at once** — a proxy buffers `text/event-stream`; disable
  buffering/compression for that route and send heartbeats ([Guide 16](16-typed-service-clients-and-sse.md)).
- **SSE stops after reconnect** — the client has no automatic resume; restart
  the call or move to the socket client ([Guide 15](15-websockets.md)).
- **CORS preflight fails** — the origin is not in `cors.allowedOrigins`; the
  default is fail-closed ([Guide 28](28-security-hardening.md)).
- **CSRF rejects every mutation** — the token header and cookie are not
  paired; GETs mint the cookie, then send `X-CSRF-Token` ([Guide 28](28-security-hardening.md)).

## 5. Migrations and builds

- **`db:schema:check` drift** — regenerate and commit the snapshot with the
  migration in the same change ([Guide 20](20-orm-and-migrations.md)).
- **Migration runs twice / at the wrong time** — `runOnBoot` is explicit; the
  runner journals by version. Check the migration directory and the config key.
- **`Cannot find module '@ndigo/...'`** — packages are not built or the
  workspace link is stale; run `pnpm install` then `pnpm build` (the CLI tests
  need the built `lib/`).
- **Decorator metadata missing** — import `@tsmetadata/polyfill` before any
  decorated class, and do not use legacy `experimentalDecorators` ([Guide 04](04-dependency-injection-and-lifecycle.md)).
- **TypeDoc fails on a link** — add the cross-package entry in
  `scripts/external-symbol-links.json`; do not hand-edit the API tree.
- **A guide check fails** — run `pnpm guides:check`; the message names the
  file and the missing block or stale link label.

## 6. Operational checks

```bash
ndigo routes ./[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)     # the registered route/mapping table
ndigo inspect ./[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)    # routes + mappings + declared config keys
ndigo doctor                         # environment/workspace diagnostics
curl -i localhost:3000/health        # liveness/readiness
```

`ndigo inspect` is the fastest answer to “is the route registered?” without
starting the app. `ndigo doctor` checks the workspace/toolchain. The management
surface ([Guide 33](33-management-endpoints.md)) exposes `/health`, `/metrics`, `/loggers`, `/env`, and
`/configprops` when enabled.

## 7. FAQ

**Why is a 500 body empty?** Internals are never leaked; the log carries the
error and trace id by design.

**Why does `@rateLimit` not apply?** It is passive metadata; the platform's
`RateLimitInterceptor` enforces it. A custom mapping must include the
interceptor.

**Why does my scheduled task run on every node?** In-process schedulers are
per process. Add `@scheduled({ lock })` or use the lock driver ([Guide 24](24-distributed-locks.md)).

**Why do signals not update from an event?** Signals are local state; use
`streamToSignal`/`EventEmitter` bridges, not a plain variable ([Guide 29](29-signals-and-islands.md)).

**Why does the browser guard not protect the API?** Client auth is UX; the
server guard is the boundary (guides [26](26-authentication-and-sessions.md)/[27](27-browser-authentication-and-oidc.md)).

**Why do Tailwind utilities not resolve `--nd-*` tokens?** Import the token
stylesheet before Tailwind, and map the tokens in `@theme`/`theme.extend`
(guide 30).

**Why are cluster slots not sharing state?** In-memory caches/locks/rate
limits are per slot; wire the Redis drivers (guides 19, 24, 28).

**Why does OIDC fail behind a proxy?** Configure `trustedProxies` and forward
`X-Forwarded-Proto` (guide 28).

**Why does `ndigo db generate` report drift?** Regenerate after entity changes
and commit both the migration and `db/schema.json` (guide 20).

## See also

- [Guide 05 — Routing & Route Conditions](05-routing-and-route-conditions.md)
- [Guide 06 — Argument Binding](06-argument-binding.md)
- [Guide 08 — Errors & Problem Details](08-errors-and-problem-details.md)
- [Guide 09 — Views & Content Negotiation](09-views-and-content-negotiation.md)
- [Guide 28 — Security Hardening](28-security-hardening.md)
- [Guide 33 — Management Endpoints](33-management-endpoints.md)
- [Guide 37 — The Ndigo CLI](37-ndigo-cli.md)
