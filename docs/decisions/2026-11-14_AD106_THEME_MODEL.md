# AD-106: Theme model — registry, request negotiation, and visual application

**Date:** 2026-11-14
**Status:** Accepted — direction approved; implementation pending
([plan](../plans/2026-11-14_THEME_MODEL.md)).

**Related:** AD-19 (content resolution), AD-95 (ndigo-ui tokens and themes),
AD-105 (the resolver/targeter split this record applies to themes).

## Context

"Theme" names three different things in the framework today, and one of them
is registered under two keys:

1. **Content theme** — a named `ContentSource` (view templates, messages,
   route partitions). `Theme { name, contentSource }`.
2. **Requested theme name** — the user's preference for _this request_,
   conceptually the Spring MVC `ThemeResolver` contract.
3. **Visual theme** — a set of `--nd-*` token overrides plus a colour
   scheme, shipped by `@ndigo/ui` and selected with `data-theme`.

Only the first two exist in code, they collide on the name `ThemeResolver`,
and the second is not wired to anything.

## Evidence

- `packages/ndigo-content/src/theme.ts:35` — `ThemeResolver` is
  `getTheme(name?): Theme`: a **registry**, Spring's `ThemeSource`.
- `packages/ndigo-content/src/theme.ts:25` — `ThemeSource` is declared as
  `{ theme: Theme }` and referenced by nothing. The name is free; no consumer
  depends on the stub shape.
- `packages/ndigo-content/src/composite.ts:55` — `CompositeThemeResolver`
  composes registries (priority order), confirming the registry semantics.
- `packages/ndigo-dispatcher/src/theme-resolver.ts:45` — the real
  `ThemeResolver`: `resolveTheme(route): string`. **No production call site**;
  only definitions and one test double match `resolveTheme(`.
- `packages/ndigo-dispatcher/src/strategies/theme-resolver-strategy.ts:37` —
  `ContextThemeResolver.resolveTheme` ignores the route and returns
  `context.getTheme().name`.
- `packages/ndigo-dispatcher/src/strategies/strategy-initializer.ts:75` —
  strategies are "resolved from the application context **once**", so no
  per-request negotiation exists.
- `packages/ndigo-platform-web/src/cookie-theme-resolver.ts:37` — reads the
  browser `Cookies` global; `:74` registers itself under
  `context.setValue('themeResolver', …)`, a third meaning of the same name.
- `packages/ndigo-platform-node/src` — no theme code at all. Server-side
  theme selection does not exist.
- `packages/ndigo-router/src/route.ts:47` — `Route` carries `attributes`
  only; it has no cookies or headers, so a transport-agnostic resolver has
  nothing to read.
- `packages/ndigo-context/src/generic-application-context.ts:582` —
  `setThemeName` mutates the application context. In a Node process that is
  **process-global** state: one request's preference would leak into another.
- `packages/ndigo-router/src/route-attributes.ts:11,18,32` — language already
  solved this: platform adapters stamp `acceptLanguage`, a resolver
  negotiates, `applyNegotiatedLanguage` writes the result back onto the
  request.
- `packages/ndigo-platform-web/src/cookie-language-resolver.ts:22` and
  `packages/ndigo-platform-node/src/node-auto-configuration.ts:230` — the
  profile split already exists for language: cookie + navigator on the
  browser, accept-header on the server, both behind one contract.
- `packages/ndigo-ui/src/common-themes.ts`, `apply-theme.ts`,
  `theme-to-css.ts` — visual themes are implemented and tested, but nothing
  supplies them an authoritative name.

## Decision

**D-1 — Three layers, one vocabulary.** Each layer owns exactly one
question, and the names are used nowhere else:

| Layer              | Question                     | Contract                            | Package                      |
| :----------------- | :--------------------------- | :---------------------------------- | :--------------------------- |
| `ThemeSource`      | given a name, which theme?   | `getTheme(name?): Theme`            | `@ndigo/content`             |
| `ThemeResolver`    | which name for this request? | `resolveThemeName(route): string`   | `@ndigo/dispatcher`          |
| Visual application | given a name, which tokens?  | `resolveVisualTheme` / `applyTheme` | `@ndigo/ui`, `@ndigo/ui-web` |

**D-2 — Rename the registry.** `@ndigo/content`'s `ThemeResolver` becomes
`ThemeSource`; `StaticThemeResolver` and `CompositeThemeResolver` become
`StaticThemeSource` and `CompositeThemeSource`; `likeThemeResolver` becomes
`likeThemeSource`. The declared-but-unused `ThemeSource` stub (`{ theme }`)
is replaced by the registry shape. `@ndigo/context`'s
`ApplicationContext.setThemeResolver` becomes `setThemeSource` and
`getTheme(name?)` is unchanged. Deprecated aliases keep the old names for one
minor release; the `0.0.x` line makes the rename cheap now and expensive
later.

**D-3 — Narrow the resolver.** `@ndigo/dispatcher`'s
`ThemeResolver.resolveTheme(route)` becomes `resolveThemeName(route): string`,
and its input is the request's _negotiated facts_, never a global. The name is
explicit rather than `resolveTheme` because `Theme` is a value type here;
`resolveLanguage` stays as it is.

**D-4 — Transport attributes, not transport reads.** `@ndigo/router` gains
`REQUESTED_THEME_ATTRIBUTE` (`requestedTheme`), `THEME_ATTRIBUTE` (`theme`),
and `applyNegotiatedTheme(route, name)` beside the language helpers.
`@ndigo/content` gains `normalizeThemeName(value): string | null` — lowercase
`^[a-z0-9]+(?:-[a-z0-9]+)*$`, at most 64 characters — because a theme name is
written into `data-theme`, `data-color-scheme`, and CSS selectors. A value
that does not match is discarded, never escaped and passed on.

**D-5 — One implementation per available input, chosen by profile.** The
split is _not_ client vs server contracts; it is the language-resolver
pattern applied to themes:

- `FixedThemeResolver` — constant (exists).
- `AttributeThemeResolver` — reads `requestedTheme` from the route,
  normalizes, falls back to the default. Registered by
  `NodeAutoConfiguration`; the Node adapter stamps the attribute from the
  `Cookie` header.
- `SystemThemeResolver` — reads `matchMedia('(prefers-color-scheme: dark)')`
  at call time (never cached), falls back to the default. Browser profile.
- `CookieThemeResolver` — stays in `@ndigo/platform-web`, gains
  normalization and a fallback chain: cookie → `SystemThemeResolver` →
  default, mirroring `CookieLanguageResolver` → `NavigatorLanguageResolver`.
- `ContextThemeResolver` — internal fallback that reads the context default.

**D-6 — Request scope owns the negotiated name.** The resolved name is
written to the route (`applyNegotiatedTheme`) and read by the renderer. The
application context keeps **only** the default name; no dispatch path may
call `setThemeName` per request. On the client, one user means the shell
context default is the session value, and `setThemeName` remains legitimate
there.

**D-7 — Profile wiring is configuration.** `WebAutoConfiguration` registers
`CookieThemeResolver`; `NodeAutoConfiguration` registers
`AttributeThemeResolver`; both under the existing `themeResolver` strategy
key, exactly as `languageResolver` is wired today. Browser-only and
full-stack apps therefore use the same contracts and differ only in the
resolver the platform installs.

**D-8 — Visual application is split by purity.** `@ndigo/ui` stays
framework-free (AD-95 D-4: zero Ndigo dependencies) and gains the two pure
helpers it can own:

- `resolveVisualTheme(name, themes?)` — explicit map, then `COMMON_THEMES`,
  then `undefined` (the caller keeps the default).
- `themeAttributes(theme)` — the `data-*` pair for SSR.

`themeToCss` already serializes the tokens. All three import cleanly in Node,
so an SSR shell needs no browser platform.

Browser wiring lives in a new `@ndigo/ui-web` package — named contract-first
like `@ndigo/telemetry-web`, not `@ndigo/ui-adapter`. It depends on
`@ndigo/ui` and on `@ndigo/platform-web` (the cookie and platform layer) and
takes a structural context slice (`{ themeName, setThemeName }`) rather than
the `ApplicationContext` type, so no existing framework package gains a UI
dependency:

- `setVisualTheme(context, name, options?)` — resolve, apply, persist.
- `connectBrowserTheme(context, options?)` — register the browser resolver,
  apply the current theme, and return a switcher.

No generic visual-theme interface is introduced: with one UI library it would
either be too thin to matter or would smuggle CSS-variable assumptions into a
supposedly neutral contract. The neutral part already exists — the theme
name — so a second UI library would supply its own map and applier.
Generalize at the second implementer.

**D-9 — One name, two lookups, independent fallbacks.** A single
`theme=solarized-dark` drives the content variant (`ThemeSource`) and the
visual theme (`resolveVisualTheme`). A name that has no content theme falls
back to the default content source; a name that has no visual theme falls
back to the Ndigo default. Neither fails the request, and neither requires
the other to be configured.

**D-10 — First paint is server-owned; hydration trusts it.** Full-stack SSR
emits `data-theme`, `data-color-scheme`, and the theme's token CSS from the
negotiated name. The client reads the attributes and does **not** re-resolve
during hydration, so there is no flash and no island mismatch. A first visit
with no cookie has no server-visible system preference: the server renders
the default, and the client may apply `SystemThemeResolver` via an inline
pre-paint script (the `next-themes` pattern) or receive
`Sec-CH-Prefers-Color-Scheme`. Client-only apps have no such gap — the
browser resolves before the first paint.

**D-11 — One call for a client-only switch.** `connectBrowserTheme` (in
`@ndigo/ui-web`) is the client control point: it registers the browser
resolver, applies the resolved visual theme, and returns a switcher that
updates the context default, the cookie, and the DOM together.
`configureBrowserTheme` in `@ndigo/platform-web` keeps its name-only meaning
and signature; the adapter calls it, never the reverse.

**D-12 — Deferred, explicitly.** A generic `@ndigo/theme` contract
(`ThemeApplier` / `ThemeSerializer`); a theme-change event on
`GenericApplicationContext`; `Sec-CH-Prefers-Color-Scheme` handling;
`prefers-contrast` negotiation; storing the negotiated name on a dedicated
per-request child context instead of route attributes.

## Consequences

- **Positive.** One meaning per name. `ThemeSource` stops being dead code and
  `ThemeResolver` stops being three things at once.
- **Positive.** Theme selection becomes per-request on Node, matching
  language negotiation, and the browser keeps a zero-round-trip path.
- **Positive.** A latent multi-tenant bug is removed: no request can change
  another request's theme through the shared application context.
- **Positive.** Visual themes gain an authoritative source (the negotiated
  name), so SSR and client agree on the first paint.
- **Positive.** Full-stack and client-only apps share contracts and differ
  only in the auto-configuration entry; nothing in `@ndigo/ui` knows about
  either.
- **Breaking (pre-1.0).** `ThemeResolver`/`StaticThemeResolver`/
  `CompositeThemeResolver`/`likeThemeResolver` and
  `setThemeResolver` are renamed; aliases are deprecated for one minor.
- **Breaking (behavior).** `resolveTheme` is replaced by `resolveThemeName`
  and is now called per dispatch, not once at startup.
- **Accepted trade-off.** Two cookie readers (browser `Cookies` and Node
  `Cookie` header) rather than one abstraction — the same duplication the
  language resolvers already accept, and the only way to keep the browser
  path free of a server round trip.
- **Accepted trade-off.** `@ndigo/ui-web` is a new package to version and
  document; it is opt-in, so an app that never installs it pays nothing.

## Migration

| Before                                                 | After                                            |
| :----------------------------------------------------- | :----------------------------------------------- |
| `import { ThemeResolver } from '@ndigo/content'`       | `ThemeSource` (alias kept, deprecated)           |
| `new StaticThemeResolver(themes, default)`             | `new StaticThemeSource(themes, default)`         |
| `context.setThemeResolver(source)`                     | `context.setThemeSource(source)`                 |
| `resolver.resolveTheme(route)`                         | `resolver.resolveThemeName(route)`               |
| `data-theme` hard-coded in a shell template            | emitted from `route.attributes[THEME_ATTRIBUTE]` |
| app calls `setThemeName` + `applyTheme` + cookie write | `connectBrowserTheme(context)` + its switcher    |

## Revisit triggers

- A second UI library needs the same bridge. Extract the generic contract
  then, from two real implementations.
- A client-only app needs reactive re-theming on a system preference change
  without re-navigation; add a subscription (or a signal) rather than making
  resolvers stateful.
- `Sec-CH-Prefers-Color-Scheme` reaches enough browsers to make the
  pre-paint script unnecessary; D-10 simplifies to a header read.
- A request needs more than a default and a negotiated name (for example
  per-feature override contexts); revisit D-6 before adding a fourth
  registration point.

## References

- Plan: [`docs/plans/2026-11-14_THEME_MODEL.md`](../plans/2026-11-14_THEME_MODEL.md)
- Content: `packages/ndigo-content/src/theme.ts`,
  `packages/ndigo-content/src/composite.ts`
- Context: `packages/ndigo-context/src/generic-application-context.ts`,
  `packages/ndigo-context/src/context-interfaces.ts`
- Negotiation template: `packages/ndigo-router/src/route-attributes.ts`,
  `packages/ndigo-dispatcher/src/language-resolver.ts`
- Dispatcher: `packages/ndigo-dispatcher/src/theme-resolver.ts`,
  `packages/ndigo-dispatcher/src/strategies/theme-resolver-strategy.ts`
- Platforms: `packages/ndigo-platform-web/src/cookie-theme-resolver.ts`,
  `packages/ndigo-platform-web/src/web-auto-configuration.ts`,
  `packages/ndigo-platform-node/src/node-auto-configuration.ts`,
  `packages/ndigo-platform-node/src/node-http-server-adapter.ts`
- Visual: `packages/ndigo-ui/src/common-themes.ts`,
  `packages/ndigo-ui/src/apply-theme.ts`,
  `packages/ndigo-ui/src/theme-to-css.ts`,
  `packages/ndigo-ui/tokens/ndigo-tokens.css`
- Browser bridge: `packages/ndigo-ui-web/src/set-visual-theme.ts`,
  `packages/ndigo-ui-web/src/connect-browser-theme.ts`
- Guides: [30 — Component integration](../guides/30-component-integration.md)
  (themes today), [09 — Views and content negotiation](../guides/09-views-and-content-negotiation.md)
- Related: [AD-95](2026-11-08_AD95_NDIGO_UI.md),
  [AD-105](2026-11-13_AD105_VIEW_TARGETING_STRATEGY.md),
  [AD-19](2026-09-13_AD19_CONTENT_I18N.md)
