# Theme model: registry → negotiation → visual application

**Date:** 2026-11-14
**Affected packages:** `@ndigo/content`, `@ndigo/context`, `@ndigo/dispatcher`,
`@ndigo/platform-node`, `@ndigo/platform-web`, `@ndigo/router`, `@ndigo/ui`,
`@ndigo/ui-web`
**Change type:** breaking (renames and per-dispatch resolution), with a
one-minor deprecation window

## Why

"Theme" named three unrelated things: a content registry (`ThemeResolver`), a
request selector (also `ThemeResolver`), and a set of visual tokens with no
runtime at all. Selection was fixed when the context started, so a user's
choice could never reach server rendering. [The theme-model decision](../decisions/2026-11-14_AD106_THEME_MODEL.md)
splits the concerns:

- **Registry** — `ThemeSource` answers "which content source owns this theme?"
- **Negotiation** — `ThemeResolver` answers "which name applies to this
  request?" and now runs per dispatch.
- **Application** — `@ndigo/ui` applies tokens and attributes; the new
  `@ndigo/ui-web` adds cookies, system preference, and context wiring.

## What changed

| Before                                              | After                                            |
| :-------------------------------------------------- | :----------------------------------------------- |
| `import { ThemeResolver } from '@ndigo/content'`    | `ThemeSource` (alias kept, deprecated)           |
| `new StaticThemeResolver(themes, default)`          | `new StaticThemeSource(themes, default)`         |
| `new CompositeThemeResolver(...)`                   | `new CompositeThemeSource(...)`                  |
| `likeThemeResolver(value)`                          | `likeThemeSource(value)`                         |
| `context.setThemeResolver(source)`                  | `context.setThemeSource(source)`                 |
| `resolver.resolveTheme(route)`                      | `resolver.resolveThemeName(route)`               |
| `data-theme` hard-coded in a shell template         | emitted from `route.attributes[THEME_ATTRIBUTE]` |
| `setThemeName` + `applyTheme` + manual cookie write | `connectBrowserTheme(context)` and its switcher  |

The registry aliases are deprecated for one minor and removed at 1.0. The
resolver method keeps a deprecated shim, so update implementations and callers
in the same change.

New request surface in `@ndigo/router`:

- `REQUESTED_THEME_ATTRIBUTE` (`requestedTheme`) — the raw cookie or header
  value a platform adapter stamps on the route.
- `THEME_ATTRIBUTE` (`theme`) — the name the resolver negotiated and the
  dispatcher recorded.
- `applyNegotiatedTheme(route, name)` — the write the dispatcher performs.

`@ndigo/platform-node` reads the `theme` cookie (exported as
`THEME_COOKIE_NAME`) on both the HTTP and socket route paths, and
`NodeAutoConfiguration` registers `AttributeThemeResolver` with `ndigo-dark`.
`@ndigo/platform-web` still registers `CookieThemeResolver`, now normalized and
chained cookie → system preference → default.

Visual application:

- `resolveVisualTheme(name, themes?)` resolves an application map first, then
  the six built-ins, and returns `undefined` for an unknown name — the page
  keeps the base tokens instead of failing.
- `themeAttributes(theme)` serializes `data-theme` / `data-color-scheme` for
  server-rendered markup, escaping the name as defense in depth.
- `setVisualTheme(context, name, options?)` applies, records, and persists one
  switch; `connectBrowserTheme(context, options?)` wires resolution and returns
  `{ theme, cookieName, setTheme, destroy }`.

`normalizeThemeName` in `@ndigo/content` rejects anything outside lowercase
kebab-case (at most 64 characters). Keep it in front of any untrusted name so a
cookie value never reaches markup or CSS.

## Migration steps

1. Bump the `@ndigo/*` set together.
2. Rename registry imports and constructor calls to the `ThemeSource` names.
   The aliases keep compiling for one minor, but update call sites now.
3. Rename `resolveTheme(route)` to `resolveThemeName(route)`. If a resolver
   cached the name at startup, remove the cache: the dispatcher calls it per
   dispatch.
4. Read the negotiated name from `route.attributes[THEME_ATTRIBUTE]` in views
   instead of hard-coding `data-theme` or reading it from the context.
5. Replace client bootstrap (`setThemeName` + `applyTheme` + cookie write) with
   `connectBrowserTheme(context)`; keep the handle for the switcher.
6. In a full-stack app, emit `data-theme` / `data-color-scheme` from the route
   in the shell so hydration can trust the server's first paint.

Resolver before and after:

```diff
-import { ThemeResolver, StaticThemeResolver } from '@ndigo/content';
-const source = new StaticThemeResolver(themes, 'ndigo-dark');
+import { ThemeSource, StaticThemeSource } from '@ndigo/content';
+const source = new StaticThemeSource(themes, 'ndigo-dark');
```

Shell before and after:

```diff
-<html lang="<%= locale %>" data-theme="dark">
+<html lang="<%= locale %>" data-theme="<%= route.attributes.theme ?? 'ndigo-dark' %>">
```

## Verification

```bash
pnpm build
pnpm test
```

Then exercise the app: request a page with `theme=solarized-dark` and confirm
the response carries `<html data-theme="solarized-dark">`; send a malformed
cookie and confirm it falls back instead of reaching markup; switch the theme in
the browser and confirm the cookie is written and the DOM attributes change.

## Rollback

Revert the `@ndigo/*` version set. There is no persisted schema change: the
theme is display state, and removing the cookie restores the default. Within the
deprecation window, a rollback needs only the version pin.

## References

- [The theme-model decision](../decisions/2026-11-14_AD106_THEME_MODEL.md)
- [Guide 30 — UI Components & Integration](../guides/30-component-integration.md)
- Issue #482
