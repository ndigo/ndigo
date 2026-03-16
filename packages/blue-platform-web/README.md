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
import {
    argumentValueConverters,
    Cookies,
    configureBrowserArgumentResolvers,
    configureCookieThemeResolver,
} from '@blue/platform-web';
import { GenericApplicationContext } from '@blue/context';

Cookies.set('theme', 'dark');
Cookies.get('theme');

const context = new GenericApplicationContext('app');
context.setThemeName('default');

// Register browser-specific method argument resolvers.
// - BrowserCookieValueMethodArgumentResolver
// - BrowserModelValueMethodArgumentResolver
// - BrowserStateValueMethodArgumentResolver
// - BrowserSessionValueMethodArgumentResolver
configureBrowserArgumentResolvers(context);

// Use built-in converter presets per resolver type.
configureBrowserArgumentResolvers(context, {
    state: 'number',
    session: { optional: true, use: argumentValueConverters.boolean },
});

// Register cookie-backed theme resolver strategy.
configureCookieThemeResolver(context, 'theme');
```

### Route Parameter Extractors

`@blue/dispatcher` route parameter extractors can now resolve browser-backed cookie and session values:

- `cookieValue(name, options?)`
- `modelValue(name, options?)`
- `stateValue(name, options?)`
- `sessionValue(name, options?)`

These are resolved at dispatch-time when compatible argument resolvers are registered in the application context.

### Optional Value Conversion

Browser argument resolvers accept an optional value converter callback:

```typescript
import { BrowserStateValueMethodArgumentResolver } from '@blue/platform-web';

const resolver = new BrowserStateValueMethodArgumentResolver((value) => Number(value));
```

Use conversion callbacks for lightweight coercion (e.g. `string` → `number`/`boolean`) while keeping parsing responsibilities in dedicated parser utilities.

Built-in converter presets are exported as `argumentValueConverters`:

- `identity`
- `number`
- `boolean`
- `date`
- `json`

## Development

```bash
pnpm --filter @blue/platform-web build:lib
pnpm --filter @blue/platform-web test
```
