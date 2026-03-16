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
    configureArgumentValueConverterRegistry,
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

// Optional: provide an app-level converter registry.
configureArgumentValueConverterRegistry(context, {
    toInt: argumentValueConverters.number,
});

configureBrowserArgumentResolvers(context, {
    state: 'toInt',
    strictNamedConverterLookup: true,
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

If a converter throws, resolvers wrap the failure in `ParameterConversionError`.
This allows error resolvers to map conversion failures to dedicated views consistently.

Built-in converter presets are exported as `argumentValueConverters`:

- `identity`
- `number`
- `boolean`
- `date`
- `json`

You can also supply named converter references in `routeParams` extractor options:

```typescript
import { modelValue, routeMapping, routeParams } from '@blue/dispatcher';

class AccountController {
    @routeMapping('/summary')
    @routeParams({
        profileId: modelValue('profile.id', { convert: 'number' }),
    })
    summary(profileId: number) {
        return profileId;
    }
}
```

## Development

```bash
pnpm --filter @blue/platform-web build:lib
pnpm --filter @blue/platform-web test
```
