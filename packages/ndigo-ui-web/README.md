# @ndigo/ui-web

> Browser theme adapter for Ndigo UI — one call applies the negotiated theme, records it on the application context, and persists the user's choice.

`@ndigo/ui` stays framework-free: it knows tokens, themes, and DOM application, but nothing about cookies, application contexts, or request negotiation. `@ndigo/ui-web` is the opt-in bridge. It resolves a theme name through the browser's cookie → system-preference → default chain, applies the result with `applyTheme`, and writes the choice back as a cookie so the next request (and the server, for a full-stack app) sees it.

## Installation

```bash
pnpm add @ndigo/ui-web
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { connectBrowserTheme } from '@ndigo/ui-web';

// One call at bootstrap: installs cookie-backed resolution, applies the
// current theme, and returns a switcher.
const theme = connectBrowserTheme(context);

button.addEventListener('click', () => theme.setTheme('solarized-dark'));
```

## Usage

### Switching the theme

```ts
import { setVisualTheme } from '@ndigo/ui-web';

// Resolve, apply, record on the context, persist as `theme=<name>`.
const applied = setVisualTheme(context, 'solarized-dark');

if (!applied) {
    // Unknown name: nothing changed, the current theme still applies.
}
```

### Custom themes

Application themes are consulted before the built-ins, so a custom theme may
shadow a built-in name:

```ts
import { createTheme } from '@ndigo/ui';

const ocean = createTheme({
    name: 'ocean',
    colorScheme: 'dark',
    tokens: { '--nd-color-bg': '#001122' },
});

connectBrowserTheme(context, { themes: { ocean } });
```

### Precedence

| Source               | Browser (`connectBrowserTheme`) | Server (full-stack)                    |
| :------------------- | :------------------------------ | :------------------------------------- |
| Explicit user choice | `theme` cookie                  | `Cookie` header → route attribute      |
| System preference    | `prefers-color-scheme`          | not visible; falls back to the default |
| Fallback             | context default                 | context default                        |

The server resolves the same cookie once per request and renders
`data-theme` / `data-color-scheme`; the browser applies the resolved theme on
boot, which is idempotent for an SSR page.

## API

The full API is at `api/` (generated; run `pnpm doc:api`). Primary exports live in
[`src/index.ts`](src/index.ts).

- **Bootstrap** — `connectBrowserTheme()` returns `{ theme, cookieName, setTheme, destroy }`
- **One-call switch** — `setVisualTheme(context, name, options?)`
- **Types** — `ThemeContextLike`, `SetVisualThemeOptions`, `BrowserThemeConnection`, `ConnectBrowserThemeOptions`

## Development

```bash
pnpm --filter @ndigo/ui-web build:lib
pnpm --filter @ndigo/ui-web test
```

## See Also

- [@ndigo/ui](../ndigo-ui/README.md) — tokens, themes, `applyTheme`, and the pure `resolveVisualTheme` / `themeAttributes` helpers
- [@ndigo/platform-web](../ndigo-platform-web/README.md) — cookie jar and the underlying `CookieThemeResolver`

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
