# Theme Model — registry, request negotiation, and visual application

**Date:** 2026-11-14
**Status:** P0 complete; P1–P4 pending
**Tracks:** [AD-106](../decisions/2026-11-14_AD106_THEME_MODEL.md) (decision),
AD-95 (ndigo-ui), AD-105 (choose/provide split), AD-19 (content resolution)

> **P0 is already on `feat/ndigo-ui-themes`.** P1–P3 change framework
> contracts and need their own worktree, branch, and tracking issue
> (AGENTS.md §8). The plan is ordered so each phase is independently
> shippable and green.

---

## 1. Problem

A theme name is resolved in three unrelated places, and two of them are named
`ThemeResolver`:

- `@ndigo/content` `ThemeResolver` is a **registry** (`getTheme(name)` →
  `Theme { name, contentSource }`). The correctly named `ThemeSource` sits
  next to it, referenced by nothing.
- `@ndigo/dispatcher` `ThemeResolver` is a **request selector**
  (`resolveTheme(route)` → name). It has no production call site, and the
  strategy resolves it **once at startup**.
- `@ndigo/platform-web` registers a third `themeResolver` via
  `context.setValue(...)`, reading the browser `Cookies` global.

Consequences:

1. **No server-side theme selection.** `@ndigo/platform-node` contains no
   theme code; a Node-rendered page cannot honour `theme=`.
2. **Process-global mutation.** `context.setThemeName` mutates shared state,
   so a per-request theme would leak between requests.
3. **No transport input.** `Route` carries only `attributes`, so a
   transport-agnostic resolver has nothing to read.
4. **Disconnected visual layer.** `@ndigo/ui` themes (P0) need an
   authoritative name; nothing produces one for SSR, so `data-theme` is
   hard-coded and drifts from the selected content variant.

Language negotiation already solves all four; themes should copy it rather
than invent a mechanism.

---

## 2. Design

### 2.1 Contracts

```ts
// @ndigo/content — registry
interface ThemeSource {
    getTheme(name?: string): Theme; // Theme { name, contentSource }
}
class StaticThemeSource implements ThemeSource {}
class CompositeThemeSource implements ThemeSource {}

// @ndigo/dispatcher — per-request selection
interface ThemeResolver {
    resolveThemeName(route: Route): string;
}
abstract class AbstractThemeResolver implements ThemeResolver {}
class FixedThemeResolver extends AbstractThemeResolver {}
class AttributeThemeResolver extends AbstractThemeResolver {} // route attribute
class SystemThemeResolver extends AbstractThemeResolver {} // matchMedia
// platform-web
class CookieThemeResolver extends AbstractThemeResolver {} // cookie → system → default

// @ndigo/ui — visual (P0) + pure helpers (new, SSR-safe)
type Theme = { name; colorScheme; tokens; description? };
function resolveVisualTheme(name: string, themes?: VisualThemeMap): Theme | undefined;
function themeAttributes(theme: Theme): { 'data-theme': string; 'data-color-scheme': string };

// @ndigo/ui-web — browser bridge (new)
type ThemeContextLike = { themeName: string; setThemeName(name: string): void };
function setVisualTheme(context: ThemeContextLike, name, options?): Theme | undefined;
function connectBrowserTheme(context: ThemeContextLike, options?): BrowserThemeConnection;
```

### 2.2 Negotiation flow

```text
                 ┌─ node:  Cookie header ─┐
transport ───────┤                        ├─► route.attributes[requestedTheme]
                 └─ web:   document.cookie┘              │
                                                          ▼
                                       ThemeResolver.resolveThemeName(route)
                                                          │
                                                          ▼
                                       applyNegotiatedTheme(route, name)
                                                          │
                        ┌─────────────────────────────────┴────────────────┐
                        ▼                                                  ▼
        route.attributes[theme] ─► SSR shell                content: getTheme(name)
        data-theme + inline tokens                          visual:  resolveVisualTheme(name)
```

The name is the only shared key. Content and visual lookup each fall back
independently, so a missing content theme never blanks the page and a missing
visual theme keeps the Ndigo default.

### 2.3 Precedence

| Source               | Browser (`CookieThemeResolver`)              | Node (`AttributeThemeResolver`) |
| :------------------- | :------------------------------------------- | :------------------------------ |
| Explicit user choice | cookie                                       | `Cookie` header → attribute     |
| System preference    | `matchMedia('(prefers-color-scheme: dark)')` | not visible; default            |
| Fallback             | context default                              | context default                 |

Client-only apps stop at the browser column and never contact Node.
Full-stack apps negotiate once per request on the server, and hydration trusts
the rendered attributes.

### 2.4 Name safety

`normalizeThemeName` (in `@ndigo/content`, used by every resolver) accepts
only `^[a-z0-9]+(?:-[a-z0-9]+)*$`, maximum 64 characters, and returns `null`
otherwise. A cookie or header value is untrusted input that reaches
`data-theme`, `data-color-scheme`, and CSS selector text; invalid values are
discarded and the fallback applies. Built-in names (`solarized-dark`,
`high-contrast-light`, …) all match this shape.

---

## 3. Phases

### P0 — Visual themes in `@ndigo/ui` (complete)

Shipped on `feat/ndigo-ui-themes`:

- Six built-in themes in `tokens/ndigo-tokens.css`: `ndigo-dark`/`ndigo-light`
  (legacy `dark`/`light` aliases), `solarized-dark`/`solarized-light`,
  `high-contrast-dark`/`high-contrast-light`.
- Typed API: `theme.ts`, `create-theme.ts`, `apply-theme.ts`,
  `theme-to-css.ts`, `common-themes.ts`; exported from `src/index.ts`.
- WCAG AA contrast tests for every theme; theme API tests; installed apps and
  locks refreshed; README, guide 30, skill, and registry docs updated.
- Exit: `pnpm build`, `pnpm lint`, `pnpm format:check`,
  `pnpm manifest:check`, and 390 `@ndigo/ui` tests green.

### P1 — Registry rename (`@ndigo/content`, `@ndigo/context`)

- `packages/ndigo-content/src/theme.ts`: rename `ThemeResolver` →
  `ThemeSource`; keep the old interface as a deprecated alias. Rename
  `StaticThemeResolver` → `StaticThemeSource`, `likeThemeResolver` →
  `likeThemeSource`; fix the TSDoc that currently calls the registry a
  resolver.
- `packages/ndigo-content/src/composite.ts`: `CompositeThemeResolver` →
  `CompositeThemeSource` (deprecated alias kept).
- `packages/ndigo-content/src/index.ts`: export the new names; keep aliases.
- `packages/ndigo-context/src/context-interfaces.ts`: add
  `setThemeSource(source: ThemeSource)`; mark `setThemeResolver` deprecated.
- `packages/ndigo-context/src/generic-application-context.ts`: rename
  `#themeResolver` → `#themeSource`, `_createThemeResolver` →
  `_createThemeSource`; `getTheme(name?)` behavior unchanged.
- `packages/ndigo-context/src/context-hierarchy.ts`: accept `themeSource` in
  `ShellContextOptions` (deprecated `themeResolver` still honoured).
- Update `apps/08-ndigo-views` and the context/content/test suites.
- Tests: new names and deprecated aliases both resolve; `getTheme()`
  default/override behavior is byte-identical; composite priority order
  unchanged.
- Exit: `@ndigo/content` and `@ndigo/context` suites green; workspace
  typecheck green.

### P2 — Request negotiation (`@ndigo/router`, `@ndigo/dispatcher`, platforms)

- `packages/ndigo-content/src/theme.ts`: add `normalizeThemeName`.
- `packages/ndigo-router/src/route-attributes.ts`:
  `REQUESTED_THEME_ATTRIBUTE = 'requestedTheme'`,
  `THEME_ATTRIBUTE = 'theme'`, `applyNegotiatedTheme(route, name)`.
- `packages/ndigo-dispatcher/src/theme-resolver.ts`: `resolveTheme(route)` →
  `resolveThemeName(route)`; keep a deprecated `resolveTheme` shim for one
  minor.
- `packages/ndigo-dispatcher/src/theme-resolver.ts`: add
  `AttributeThemeResolver` (attribute → normalize → default) and
  `SystemThemeResolver` (`matchMedia` read at call time, guarded for
  non-DOM runtimes, default fallback).
- `packages/ndigo-dispatcher/src/strategies/theme-resolver-strategy.ts`:
  resolve **per dispatch**; `ContextThemeResolver` becomes the fallback that
  returns `context.themeName`; `createDefaultThemeResolver` keeps its
  startup-fixed behavior only for apps that never configure a resolver.
- `packages/ndigo-dispatcher/src/dispatcher.ts`: after language resolution,
  call `resolveThemeName(route)` once and `applyNegotiatedTheme(route, name)`;
  never call `context.setThemeName` on this path.
- `packages/ndigo-platform-node/src/node-http-server-adapter.ts`: stamp
  `requestedTheme` from the `Cookie` header (next to `acceptLanguage`).
- `packages/ndigo-platform-node/src/node-auto-configuration.ts`: register
  `AttributeThemeResolver` under `themeResolver`.
- `packages/ndigo-platform-web/src/cookie-theme-resolver.ts`: normalize the
  cookie value; fall back to `SystemThemeResolver`, then the default.
- `packages/ndigo-platform-web/src/web-auto-configuration.ts`: register
  `CookieThemeResolver` under `themeResolver`.
- Tests: precedence matrix (cookie wins, invalid cookie falls through, absent
  cookie → system, system absent → default), injection rejection
  (`"><script>`, quotes, uppercase, over-length), per-request isolation
  (two sequential dispatches with different cookies), and a Node render test
  asserting `data-theme="solarized-dark"` plus `color-scheme: dark` in the
  document.
- Exit: dispatcher, router, node and web suites green; no `setThemeName`
  call remains on a dispatch path.

### P3 — Visual application (`@ndigo/ui`, `@ndigo/ui-web`)

- `@ndigo/ui` gains two pure helpers (no dependencies added).
- `src/resolve-visual-theme.ts`: `VisualThemeMap`,
  `resolveVisualTheme(name, themes?)` → explicit map, then `COMMON_THEMES`,
  then `undefined`.
- `src/theme-attributes.ts`: `themeAttributes(theme)` with attribute-value
  escaping (defense in depth; `normalizeThemeName` is the primary gate).
- Both helpers are tested in the Node environment to prove they are
  SSR-importable.
- `packages/ndigo-ui-web/package.json`: `@ndigo/ui` and
  `@ndigo/platform-web` in `dependencies`; `setVisualTheme` accepts a
  structural `{ themeName, setThemeName }`, so no existing package gains a
  UI dependency.
- `src/set-visual-theme.ts`: `setVisualTheme(context, name, options?)` —
  resolve, `applyTheme` on the target, persist the cookie, return the applied
  theme or `undefined`.
- `src/connect-browser-theme.ts`: `connectBrowserTheme(context, options?)` —
  call `configureBrowserTheme` from `@ndigo/platform-web`, apply the current
  theme, return `{ theme, setTheme(name), destroy() }`.
- `src/index.ts`: exports. `README.md` per the package standard; `api/`
  regenerated by `pnpm doc:api`.
- Tests: map precedence (explicit over built-in), unknown name → `undefined`,
  attribute serialization/escaping, jsdom apply/remove and cookie persistence,
  switcher updates context + DOM, and an import-without-DOM test (node
  environment).
- Exit: both packages build, tests green, `pnpm manifest:check` green.

### P4 — Documentation, example, validation

- Guide 30: add a "Theme selection" section with the three profiles
  (client-only, full-stack SSR, hydrated), the precedence table, and the
  one-call client switch.
- Guide 09: cross-link theme negotiation beside language negotiation.
- `packages/ndigo-ui/README.md`: link the adapter and state that `@ndigo/ui`
  itself stays framework-free.
- Example: a theme switcher in `apps/20-ndigo-ui-lab` using
  `connectBrowserTheme` (which wraps `configureBrowserTheme`); verify SSR
  output in a Node-rendered app (`apps/07-ndigo-island` or
  `apps/08-ndigo-views`).
- Update `docs/decisions/README.md` and `docs/plans/README.md`; mark AD-106
  implemented when P1–P3 land.
- Validation:

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm format:check
pnpm manifest:check
pnpm doc:api          # new public API → regenerate packages/*/api
pnpm agents:sync      # only if skill text changes
graft build
```

---

## 4. Testing strategy

| Layer               | Test                                                                                       | Where                                      |
| :------------------ | :----------------------------------------------------------------------------------------- | :----------------------------------------- |
| Name safety         | accepted/rejected table (`solarized-dark`, `dark`, `Light`, `a b`, `"><script>`, 65 chars) | `@ndigo/content`                           |
| Registry rename     | new + deprecated names, default/override parity                                            | `@ndigo/content`, `@ndigo/context`         |
| Resolver precedence | cookie → system → default; attribute → default                                             | `@ndigo/dispatcher`, `@ndigo/platform-web` |
| Request isolation   | two sequential dispatches, different cookies, no bleed                                     | `@ndigo/platform-node`                     |
| SSR output          | `data-theme`, `data-color-scheme`, inline `themeToCss`                                     | `@ndigo/platform-node`                     |
| Client-only         | no fetch, theme applied during bootstrap                                                   | `@ndigo/ui-web`                            |
| Hydration           | rendered attributes are not re-resolved on the client                                      | `@ndigo/ui-web`                            |
| Visual mapping      | explicit map → built-in → `undefined`                                                      | `@ndigo/ui-web`                            |

---

## 5. Compatibility and risks

| Risk                                            | Assessment                  | Mitigation                                                                   |
| :---------------------------------------------- | :-------------------------- | :--------------------------------------------------------------------------- |
| Rename breaks importers                         | Low — `0.0.x`, aliases kept | Deprecated aliases; workspace-wide typecheck                                 |
| Two cookie readers (browser + Node)             | Accepted                    | Same duplication as language resolvers; one shared normalizer                |
| Startup-fixed default changes behavior          | Medium                      | Keep the fixed default when no resolver is configured; characterization test |
| System preference changes without re-navigation | Low                         | `SystemThemeResolver` reads live; subscription deferred (AD-106 D-12)        |
| First visit flash on full-stack                 | Medium                      | Default render + optional pre-paint script; documented, not hidden           |
| Adapter drifts from `@ndigo/ui`                 | Low                         | `@ndigo/ui` is a hard dependency; `api/` regenerated                         |
| Theme name used in CSS/HTML                     | Low with gate               | `normalizeThemeName` on every untrusted input; escape on serialization       |
| `pnpm-lock.yaml` conflict (new package)         | Medium — single-lane file   | One PR for P3; rebase before merge                                           |

---

## 6. Out of scope (explicit)

- **Generic visual-theme contract** (`@ndigo/theme`, `ThemeApplier`,
  `ThemeSerializer`) — generalize at the second UI library (AD-106 D-12).
- **Theme-change event on `GenericApplicationContext`** — client reactivity
  can use `@ndigo/signals` when a real requirement appears.
- **`Sec-CH-Prefers-Color-Scheme` and `prefers-contrast`** — revisit when
  browser support makes them worth the branch.
- **Per-feature theme overrides** (a child context with its own theme) —
  would introduce a fourth registration point; no consumer yet.
- **Theming non-HTML surfaces** (email, PDF) — separate representation
  concern.

---

## 7. Resolved decisions

| #   | Decision                    | Resolution                                                                                        |
| :-- | :-------------------------- | :------------------------------------------------------------------------------------------------ |
| 1   | Package name for the bridge | `@ndigo/ui-web` (contract-first, like `telemetry-web`); `ui-adapter` rejected as a generic suffix |
| 2   | Where the adapter lives     | Separate opt-in package; no framework package depends on `@ndigo/ui`                              |
| 3   | Resolver method name        | `resolveThemeName` — explicit that it returns a name, not a `Theme`                               |
| 4   | Attribute names             | `requestedTheme` (transport) and `theme` (negotiated), mirroring `acceptLanguage` / `language`    |
| 5   | Trust boundary              | Normalize on read in `@ndigo/content`; escape on write in `@ndigo/ui-web`                         |
| 6   | Content/visual mismatch     | Independent fallbacks; the request never fails                                                    |
| 7   | Client-only path            | Direct resolver + `applyTheme`; no dispatcher or network required                                 |
| 8   | Rename strategy             | Deprecated aliases for one minor, not a flag day                                                  |

---

## 8. Review disposition

| #   | Point                                              | Disposition                                                                          |
| :-- | :------------------------------------------------- | :----------------------------------------------------------------------------------- |
| 1   | Don't couple `@ndigo/content` to CSS               | Accepted — visual tokens stay in `@ndigo/ui`; the name is the only shared key        |
| 2   | Don't make framework modules depend on `@ndigo/ui` | Accepted — adapter owns the edge and depends on the platform, never the reverse      |
| 3   | Don't expand `ThemeResolver`; split it             | Accepted — registry renamed, selector narrowed                                       |
| 4   | Client-only must not round-trip to Node            | Accepted — browser chain resolves locally; SSR is an optimisation, not a requirement |
| 5   | Generic UI-library interface                       | Deferred — Rule of Three; the neutral contract is the name                           |
| 6   | Per-request scope                                  | Accepted — route attributes, matching language; context keeps the default only       |
