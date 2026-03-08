# Blue Boot

Blue Boot provides application startup primitives for BlueJS.

## Features

- Application lifecycle bootstrap helpers
- Strong integration with `@blue/context`
- Router wiring support via `@blue/router`
- ESM-first package for Nx/pnpm monorepo workflows

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
