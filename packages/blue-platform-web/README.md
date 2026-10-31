# Blue Platform Web

> Browser-specific platform integrations for BlueJS — argument resolvers, converters, and cookie helpers.

Blue Platform Web provides browser-specific platform integrations for BlueJS.

## Installation

```bash
pnpm add @blue/platform-web
```

## Getting Started

> **Note**: If you are using `@blue/boot` to launch your application in the browser, these resolvers and converters are registered automatically. Manual configuration is only required for custom setups.

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
// - BrowserHistoryStateValueMethodArgumentResolver
// - BrowserSessionStorageValueMethodArgumentResolver
// - BrowserLocalStorageValueMethodArgumentResolver
// - BrowserDataBindingMethodArgumentResolver
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

## Usage

### End-to-End Conversion Pattern

```typescript
import { GenericApplicationContext } from '@blue/context';
import {
    cookieValue,
    errorHandler,
    errorMapping,
    ParameterConversionError,
    routeMapping,
    parameters,
    historyStateValue,
} from '@blue/dispatcher';
import {
    argumentValueConverters,
    configureArgumentValueConverterRegistry,
    configureBrowserArgumentResolvers,
} from '@blue/platform-web';

const context = new GenericApplicationContext('app');

configureArgumentValueConverterRegistry(context, {
    toInt: argumentValueConverters.number,
});

configureBrowserArgumentResolvers(context, {
    state: 'toInt',
    strictNamedConverterLookup: true,
});

@routeMapping('/account')
class AccountController {
    @routeMapping('/summary')
    @parameters({
        amount: cookieValue('amount', { convert: 'toInt' }),
        txCount: historyStateValue('txCount', { convert: { optional: true, use: 'toInt' } }),
    })
    summary(amount: number, txCount: number | null) {
        return { amount, txCount };
    }
}

@errorHandler
class GlobalErrorHandler {
    @errorMapping(ParameterConversionError)
    onConversionError(route, error: ParameterConversionError) {
        return { viewName: 'conversion-error', message: error.message };
    }
}
```

### Route Parameter Extractors

`@blue/dispatcher` route parameter extractors can now resolve browser-backed cookie, storage, and history-state values:

- `cookieValue(name)`
- `historyStateValue(name)`
- `sessionStorageValue(name)`
- `localStorageValue(name)`
- `dataBinderValue(source, Target?)` — whole-source binding for `query`, `cookie`, `session-storage`, `local-storage`

These are resolved at dispatch-time when compatible argument resolvers are registered in the application context.

### Optional Value Conversion

Resolver classes are constructed argument-less; conversion is applied at the
extractor level via `convertType` (or the `asNumber`/`asBoolean`/`asDate`/
`asJson` wrappers) for lightweight coercion (e.g. `string` → `number`/`boolean`)
while keeping parsing responsibilities in dedicated parser utilities:

```typescript
import { historyStateValue, asNumber } from '@blue/dispatcher';

const extractor = asNumber(historyStateValue('txCount'));
```

If a converter throws, resolvers wrap the failure in `ParameterConversionError`.
This allows error resolvers to map conversion failures to dedicated views consistently.

Built-in converter presets are exported as `argumentValueConverters`:

- `identity`
- `number`
- `boolean`
- `date`
- `json`

You can also supply named converter references in `parameters` extractor options:

```typescript
import { historyStateValue, routeMapping, parameters } from '@blue/dispatcher';

class AccountController {
    @routeMapping('/summary')
    @parameters({
        profileId: historyStateValue('profile.id', { convert: 'number' }),
    })
    summary(profileId: number) {
        return profileId;
    }
}
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/platform-web build:lib
pnpm --filter @blue/platform-web test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
