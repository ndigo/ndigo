# Blue Boot

Blue Boot provides application startup primitives for BlueJS.

## Features

- Application lifecycle bootstrap helpers
- Environment-aware auto-configuration
- Strong integration with `@blue/context`
- ESM-first package for Nx/pnpm monorepo workflows

## Auto-configuration

`@blue/boot` automatically provisions common framework components based on the environment.

### Web Auto-configuration

When running in a browser environment, `@blue/boot` automatically registers:

- **Argument Resolvers**: Cookie, Model, Session, and State resolvers for `@routeParams`.
- **Converter Registry**: Built-in converters (number, boolean, date, json) for type-safe parameter extraction.

This behavior is enabled by default when using `Application` or `ApplicationBuilder` in the browser.

## Notes

- `Site` and `SiteBuilder` were removed.
- Use the context tree (`@blue/context`) to orchestrate multiple applications via parent/child contexts.

## Installation

```bash
pnpm add @blue/boot
```

## Usage

```typescript
import { GenericApplicationContext } from '@blue/context';
import { configureBrowserTheme } from '@blue/boot';

const context = new GenericApplicationContext('app');

configureBrowserTheme(context, {
    themeName: 'default',
    cookieName: 'theme',
});
```

`@blue/boot` provides framework-level bootstrap helpers and is typically consumed by application setup code.

## Development

```bash
pnpm --filter @blue/boot build:lib
pnpm --filter @blue/boot test
```
