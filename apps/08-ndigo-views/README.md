# ndigo-views — View Resolution Demo

> View-resolution demo: one ordered resolver chain over three view locations —
> a component module, a context entry, and a module on disk — plus a
> centralized view-targeter chain that places each result in a DOM region.

The demo's controllers return view **names** only; an ordered
`ViewResolverComposite` decides where each name comes from, and
`ViewsTargetingConfiguration` decides **where it lands**. The app also
carries the `/client` HTTP demo (response cache + offline replay) and browser
telemetry.

## Run

```bash
cd apps/08-ndigo-views && pnpm dev
```

| Route           | View name    | Resolver (location)                                | Region (targeter)          |
| --------------- | ------------ | -------------------------------------------------- | -------------------------- |
| `/`             | `shell`      | `WebComponentViewResolver` (component module)      | `#app` (name)              |
| `/widget`       | `footer`     | `NameViewResolver` (context entry)                 | `#site-footer` (name)      |
| `/widget/:lang` | `footer`     | same entry — localized through `@ndigo/content`    | `#site-footer` (name)      |
| `/report`       | `report`     | `ReportViewResolver` (module on disk, lazy import) | `#sidebar` (route pattern) |
| `/client`       | `clientDemo` | `WebComponentViewResolver` (component module)      | `#app` (fallback)          |
| `/nope`         | —            | chain fall-through → `NoViewFoundError`            | —                          |

## Demonstrates

- Three view locations behind one ordered chain (first match wins):
    1. `WebComponentViewResolver` — eager component registry keyed by logical
       name and mapped through `@TagMapping` metadata (`shell` →
       `ndigo-views-shell`, `clientDemo` → `ndigo-views-client`); the `viewNames`
       filter lets unmatched names fall through.
    2. `NameViewResolver` — a plain view entry registered in the context
       (`footer`): entry-name resolution.
    3. `ReportViewResolver` — a path-based resolver that dynamic-imports
       `views/report-view.ts` on first resolution; the module's default export
       is the view class, loaded lazily.
- Controllers return `ModelAndView` view names exclusively; no controller
  constructs a view.
- i18n: the `footer` model resolves through `@ndigo/content`'s
  `ContentSource` (`/widget/de`, `/widget/fr`), falling back to the default
  language.
- **Centralized view targeting.** Controllers stay DOM-unaware;
  `ViewsTargetingConfiguration` (`src/views-targeting-configuration.ts`)
  installs an ordered `viewTargeters` chain:
    1. `NameViewTargeter` — logical name → region (`shell`/`footer` →
       `#app`/`#site-footer`); the map form treats the name as a lookup key,
       never selector text.
    2. `RouteViewTargeter` — route glob → region (`/report` → `#sidebar`)
       through the router's path-pattern matcher.
       First non-`null` target wins; when neither matches, the dispatcher falls
       back to the registered `viewTarget` (`#app` in the real app, an in-memory
       capture target under `bootWebApp`). `test/targeting.spec.ts` asserts the
       regions directly, and `test/views.spec.ts` keeps the resolver-only behavior
       green by booting `ViewsAppConfiguration` alone.
- `/client` exercises the `@ndigo/http` client with an interceptor chain: an
  auth-style request stamp, the response cache, and
  `RetryOnOfflineInterceptor` — requests issued while offline are queued and
  replayed when the browser comes back online. Credentialed requests bypass
  the cache (cross-user cache hits are a security bug), and the payload
  derivation is memoized for 60 s through `@ndigo/cache`.
- Browser telemetry (`@ndigo/telemetry-web`): the client span is propagated as
  a W3C `traceparent` header, so a matching server span (e.g. ndigo-api)
  continues the same trace.

## Development

```bash
cd apps/08-ndigo-views && pnpm test
```

## See Also

- [apps/README](../README.md) — the applications progression
- [ndigo-hello](../01-ndigo-hello/README.md) — the decentralized contrast: a
  handler-built view and one registered target, with no chains involved
- [ndigo-api](../05-ndigo-api/README.md) — content negotiation: the same logical
  view served as JSON or CSV by path extension / `Accept`
- [@ndigo/view](../../packages/ndigo-view/README.md) — view resolvers, the
  composite chain, and the view-targeter contract
- [@ndigo/view-webcomponent](../../packages/ndigo-view-webcomponent/README.md) —
  the selector-backed targeters (`Name`/`Route`/`Attribute`) and DOM targets
- [@ndigo/content](../../packages/ndigo-content/README.md) — content sources and
  i18n

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
