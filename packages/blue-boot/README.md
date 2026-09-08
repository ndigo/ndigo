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

### ApplicationBuilder (recommended)

DI-container bootstrap for server-side apps. Registers sources, prepares the
environment, refreshes the context, and returns it — the handler mapping +
dispatcher auto-initialize on refresh, and a managed `httpServer` entry is
provisioned by `NodeAutoConfiguration`.

```typescript
import { ApplicationBuilder } from '@blue/boot';
import { NodeAutoConfiguration, HTTPServer, gracefulShutdown } from '@blue/platform-node';
import { MyConfiguration } from './my-configuration';

const context = new ApplicationBuilder([NodeAutoConfiguration, MyConfiguration]).run();
const server = context.getValue<HTTPServer>('httpServer');
await server.start();
gracefulShutdown(context, { resources: [server] });

// SIGINT/SIGTERM → server drains → context.close() → exit 0
```

Full walkthrough: [`docs/guides/01-building-a-node-api.md`](../../docs/guides/01-building-a-node-api.md).

### Programmatic context

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
