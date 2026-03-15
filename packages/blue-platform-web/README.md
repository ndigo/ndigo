# Blue Platform Web

Blue Platform Web provides browser-specific platform integrations for BlueJS.

## Features

- Browser environment helpers
- Cookie utilities and cookie-based argument resolution
- Cookie theme resolver support
- Router/dispatcher web-platform glue components

## Installation

```bash
pnpm add @blue/platform-web
```

## Usage

```typescript
import { Cookies, configureBrowserArgumentResolvers, configureCookieThemeResolver } from '@blue/platform-web';
import { GenericApplicationContext } from '@blue/context';

Cookies.set('theme', 'dark');
Cookies.get('theme');

const context = new GenericApplicationContext('app');
context.setThemeName('default');

// Register browser-specific method argument resolvers.
// - BrowserCookieValueMethodArgumentResolver
// - BrowserSessionValueMethodArgumentResolver
configureBrowserArgumentResolvers(context);

// Register cookie-backed theme resolver strategy.
configureCookieThemeResolver(context, 'theme');
```

### Route Parameter Extractors

`@blue/dispatcher` route parameter extractors can now resolve browser-backed cookie and session values:

- `cookieValue(name, options?)`
- `sessionValue(name, options?)`

These are resolved at dispatch-time when compatible argument resolvers are registered in the application context.

## Development

```bash
pnpm --filter @blue/platform-web build:lib
pnpm --filter @blue/platform-web test
```
