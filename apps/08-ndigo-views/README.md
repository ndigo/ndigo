# ndigo-views — View Resolution Demo

> View-resolution demo: one ordered resolver chain over three view locations —
> a component module, a context bean, and a module on disk.

The demo's controllers return view **names** only; an ordered
`ViewResolverComposite` decides where each name comes from. The app also
carries the `/client` HTTP demo (response cache + offline replay) and browser
telemetry.

## Run

```bash
cd apps/08-ndigo-views && pnpm dev
```

| Route           | View name    | Resolver (location)                                |
| --------------- | ------------ | -------------------------------------------------- |
| `/`             | `shell`      | `WebComponentViewResolver` (component module)      |
| `/widget`       | `footer`     | `NameViewResolver` (context bean)                  |
| `/widget/:lang` | `footer`     | same bean — localized through `@ndigo/content`     |
| `/report`       | `report`     | `ReportViewResolver` (module on disk, lazy import) |
| `/client`       | `clientDemo` | `WebComponentViewResolver` (component module)      |
| `/nope`         | —            | chain fall-through → `NoViewFoundError`            |

## Demonstrates

- Three view locations behind one ordered chain (first match wins):
    1. `WebComponentViewResolver` — eager component registry keyed by logical
       name and mapped through `@TagMapping` metadata (`shell` →
       `ndigo-views-shell`, `clientDemo` → `ndigo-views-client`); the `viewNames`
       filter lets unmatched names fall through.
    2. `NameViewResolver` — a plain view bean registered in the context
       (`footer`): bean-name resolution.
    3. `ReportViewResolver` — a path-based resolver that dynamic-imports
       `views/report-view.ts` on first resolution; the module's default export
       is the view class, loaded lazily.
- Controllers return `ModelAndView` view names exclusively; no controller
  constructs a view.
- i18n: the `footer` model resolves through `@ndigo/content`'s
  `ContentSource` (`/widget/de`, `/widget/fr`), falling back to the default
  language.
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
- [ndigo-api](../05-ndigo-api/README.md) — content negotiation: the same logical
  view served as JSON or CSV by path extension / `Accept`
- [@ndigo/view](../../packages/ndigo-view/README.md) — view resolvers and the
  composite chain
- [@ndigo/content](../../packages/ndigo-content/README.md) — content sources and
  i18n

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
