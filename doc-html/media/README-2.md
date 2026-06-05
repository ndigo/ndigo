# Blue Content

Blue Content defines content and theme abstractions used across BlueJS packages.

## Features

- `ContentSource` interface for localized/content-key lookups
- `Theme` and `ThemeSource` contracts for theme-aware rendering
- `StaticContentSource` with default language fallback
- `StaticThemeResolver` for in-memory theme lookup
- Awareness mixins (`AsContentSourceAware`) and duck-type guards
- Integration with `@blue/factory` and `@blue/core`

## Installation

```bash
pnpm add @blue/content
```

## Usage

```typescript
import { StaticContentSource, StaticThemeResolver, Theme } from '@blue/content';

const contentSource = new StaticContentSource({
    welcome: {
        en: 'Welcome',
        es: 'Bienvenido',
    },
});

const theme: Theme = {
    name: 'default',
    contentSource,
};

const resolver = new StaticThemeResolver([theme], 'default');
resolver.getTheme().contentSource.getContent('welcome', 'en');
```

## Development

```bash
pnpm --filter @blue/content build:lib
pnpm --filter @blue/content test
```
