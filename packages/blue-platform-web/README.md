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
import { Cookies, configureCookieThemeResolver } from '@blue/platform-web';
import { GenericApplicationContext } from '@blue/context';

Cookies.set('theme', 'dark');
Cookies.get('theme');

const context = new GenericApplicationContext('app');
context.setThemeName('default');
configureCookieThemeResolver(context, 'theme');
```

## Development

```bash
pnpm --filter @blue/platform-web build:lib
pnpm --filter @blue/platform-web test
```
