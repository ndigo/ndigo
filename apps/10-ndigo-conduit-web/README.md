# @ndigo/conduit-web — RealWorld (Conduit) frontend

> The [RealWorld](https://github.com/realworld-apps/realworld) “Conduit” frontend on Ndigo — a hash-routed browser app whose controllers build models, whose views are web components, and whose state lives in `@ndigo/signals`, driving the in-repo [`@ndigo/conduit-api`](../11-ndigo-conduit-api) over a Vite dev proxy.

The RealWorld spec is the reference target: readers, feeds, tags, articles,
favorites, follows and comments are the full surface a Conduit frontend must
serve, and the backend it talks to is the conformance-checked sibling app in this
repository — so the whole stack, from a click to the SQL-free in-memory store and
back, runs from a clean checkout with no external service.

## Run

The API first (port 3040 — its reserved port):

```bash
cd apps/11-ndigo-conduit-api && pnpm start
```

Then this app (port 3400):

```bash
cd apps/10-ndigo-conduit-web && pnpm dev
# → http://localhost:3400
```

**The proxy.** `vite.config.ts` forwards `/api` to `http://127.0.0.1:3040`, so
the browser app is _same-origin_ with the API in dev: `/api/tags` on port 3400 is
the API's `/api/tags`, no CORS preflight, and the JWT never crosses an origin
boundary. The client uses origin-absolute paths (`/api/…`) with no `baseURL`, so
the same code is correct behind any reverse proxy in a build — the proxy target
is the only dev-time coupling.

**Pointing at another API.** Any RealWorld-compatible backend works:

```bash
CONDUIT_API_TARGET=https://conduit.productionready.proxy pnpm dev   # or your own host
```

## Routes

Hash routing (`@ndigo/platform-web`'s `HashRouter`), so every page is linkable and
sharable.

| Route                           | Page                                                                       |
| ------------------------------- | -------------------------------------------------------------------------- |
| `#/`                            | Home feed: Your Feed / Global Feed tabs, tag sidebar, articles, pagination |
| `#/login`                       | Sign in (per-field error surfacing)                                        |
| `#/register`                    | Sign up (per-field error surfacing)                                        |
| `#/settings`                    | Profile + account settings, sign out — **requires a session**              |
| `#/editor`                      | Publish a new article — **requires a session**                             |
| `#/editor/:slug`                | Edit (and delete) an existing article — **requires a session**             |
| `#/article/:slug`               | Article body, follow/favorite, comments, author controls                   |
| `#/profile/:username`           | Profile with the authored-articles tab and a follow control                |
| `#/profile/:username/favorited` | Profile with the favorited-articles tab                                    |

Unauthenticated access to a guarded route is refused at the router and lands on
`#/login`; a `401` from _any_ call drops the stored session and does the same.

## Demonstrates

- **`HashRouter` + `BrowserDispatcher` with thin controllers.** Each controller
  awaits the service that owns its data and returns one `ModelAndView`; no
  controller formats, filters, or pages — those live in the service (state) and
  the view (presentation).
- **Web-component views with the view-event bridge.** Views are `@TagMapping`
  custom elements that render a model and `emit` intents; the
  `DOMElementViewTarget` maps a declared set of those DOM events onto application
  events (`conduit-events.ts`), and one wiring module dispatches them to services
  (`conduit-actions.ts`) — the complete, auditable interaction surface.
- **`@ndigo/signals` as the state layer.** Session, feed window, article,
  profile and comment state are signals; a mutation re-renders the current route
  through `router.refresh()` (AD-53 D-3) instead of a second render path.
- **Keyed loading.** `ensureFeed`/`ensureArticle`/`ensureProfile` fetch only when
  the query (tab/tag/page, slug, username) actually changed — which is what makes
  optimistic updates viable: favoriting patches the cached list and re-renders
  the patch instead of re-fetching the pre-mutation list over it.
- **Optimistic favorite and follow with rollback.** Both flip cached state and
  re-render immediately, await the API, merge the server's authoritative values
  (a duplicated favorite cannot drift the count) and roll the flip back on
  failure. Covered by specs, and observable against the local API.
- **`@ndigo/http` with an auth-header interceptor and a global 401 reaction.** One
  client instance stamps `Authorization: Token <jwt>` from the session and turns
  any `401` into "drop the session, go to login"; callers never touch a status
  code — the `{errors:{…}}` envelope arrives as one typed `ConduitApiError`.
- **The RealWorld error envelope mapped onto forms.** Field keys render under the
  offending input, everything else (`credentials`, `body`) renders as a
  form-level message; the envelope is stamped with the form that produced it, so
  a login failure never leaks into the register form.
- **An in-app Markdown renderer.** See the decision note below.

## Decision: the Markdown renderer is in-app

Article bodies are Markdown, and the app renders them with a ~180-line
escaping-by-default renderer (`src/lib/markdown.ts`) instead of a dependency.

- **Escaping by default.** Every character of the source is HTML-escaped and the
  only markup that can reach the DOM is that module's own fixed tag set; there is
  no raw-HTML pass and no attribute passthrough. Link targets are scheme-checked
  (`javascript:`/`data:` collapse to `#`), so a hostile body cannot escape its
  text node or smuggle an event handler. The `<script>alert(1)</script>` in a
  published body renders as visible text.
- **Deliberately small.** Headings, fenced code, ordered/unordered lists,
  blockquotes, paragraphs, and inline code/bold/italic/links. Anything else is
  literal text — a documented boundary, not an accident.
- **Why not a library:** the requirement is a _safe_ subset, and the security
  argument for a full parser (`sanitize-html`, `DOMPurify`) does not apply when
  no raw HTML is ever passed through. Adding a Markdown plus a sanitizer
  dependency to render four constructs is weight without benefit; the escaping
  contract is one module a reader can verify in a sitting.

## Session & token storage (threat model)

The RealWorld contract requires the JWT back on every request as
`Authorization: Token <jwt>`, so the app persists it in `localStorage`
(`session-service.ts`). That is an XSS-theft surface **by design**: any script
that executes in this origin can read the token. The defense is that the app
itself never renders untrusted markup — the article body goes through the
allowlisted renderer above and every other value reaches the DOM as
`textContent` — so there is no in-app path from a hostile article to script
execution. For deployments under a higher threat model (CMS plugins, third-party
scripts, shared origins), switch to an `HttpOnly; SameSite` session cookie with
a non-RealWorld backend, or front the API with a reverse proxy that moves the
token server-side (REV-010).

## Tests

```bash
pnpm --filter @ndigo/conduit-web test        # vite build && vitest run
```

107 cases across ten suites; the `test` script builds first because bundle
validity (no raw TC39 decorators in `dist/`, HI-1) is a gate here.

| Suite                             | Covers                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `routes.spec.ts`                  | Every route through `MockWebClient` — real controllers, real services, stub API                                           |
| `auth-router-interceptor.spec.ts` | The guard driven through a real `HashRouter` (redirect, allowed, public)                                                  |
| `conduit-client.spec.ts`          | Auth header, no-header anonymous, 422 envelope, 401 hook, 204, unreachable API, query building                            |
| `session-service.spec.ts`         | Login/register/update envelopes, token persistence, restore, logout, 401 drop                                             |
| `article-service.spec.ts`         | Keyed loading, pagination state, tag/tab interaction, optimistic favorite rollback, editor envelope, by-line follow patch |
| `profile-service.spec.ts`         | Route-driven tabs, windowing, follow rollback                                                                             |
| `conduit-actions.spec.ts`         | The view-event → service wiring, including the feed invalidation a follow implies                                         |
| `views.spec.ts`                   | Every view's rendering, form drafts surviving a refresh, emitted intents, sanitized body                                  |
| `markdown.spec.ts`                | Escaping, the supported constructs, `javascript:` neutralization                                                          |
| `bundle.spec.ts`                  | Every emitted `dist/**/*.js` parses as an ES module (decorator-lowering guard)                                            |

## See Also

- [apps/README](../README.md) — the numbered application ladder and port registry
- [11 — Conduit API](../11-ndigo-conduit-api/README.md) — the backend this app drives, and its spec conformance notes
- [03 — TodoMVC](../03-ndigo-todo-web/README.md) — the router/views/signals/auth reference for this app's structure
- [Guide 29 — Signals & Islands](../../docs/guides/29-signals-and-islands.md) — the reactive state layer
- [Guide 36 — Testing with @ndigo/test](../../docs/guides/36-testing.md) — `MockWebClient`/`MemoryViewTarget`
- [Guide 11 — The HTTP client](../../docs/guides/11-http-client.md) — interceptors, transforms, parsers
- [RealWorld spec](https://github.com/realworld-apps/realworld/tree/main/specs/api) — the API contract and official collections

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
