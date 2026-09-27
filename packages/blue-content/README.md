# Blue Content

> Content and theme abstractions for BlueJS — localized lookups, theme-aware rendering, and default-language fallback.

Blue Content defines content and theme abstractions used across BlueJS packages.

## Installation

```bash
pnpm add @blue/content
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

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

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

- **Sources** — `ContentSource`, `StaticContentSource` (default-language fallback), `ThemeSource`
- **Themes** — `Theme`, `StaticThemeResolver`
- **Mixins & guards** — `AsContentSourceAware` awareness mixins and duck-type guards

## Development

```bash
pnpm --filter @blue/content build:lib
pnpm --filter @blue/content test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
