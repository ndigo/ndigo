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
const welcome = await resolver.getTheme().contentSource.getContent('welcome', 'en');
// 'Welcome'
```

## Usage

### Canonical language codes

```ts
import { LanguageCode } from '@blue/content';

new LanguageCode('EN-us').code; // 'en-US' — canonicalized
LanguageCode.for('en_us'); // null — invalid tags never become codes
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

- **Sources** — `ContentSource`, `StaticContentSource` (default-language fallback), `ThemeSource`
- **Language codes** — `LanguageCode` (validated, canonicalized BCP 47 tags) and the `LanguageCodes` constant catalog (`LanguageCodes.EN_US` instead of `'en-US'` magic strings)
- **Themes** — `Theme`, `StaticThemeResolver`
- **Mixins & guards** — `AsContentSourceAware` awareness mixins and duck-type guards

`LanguageCode` implements `Equatable<LanguageCode>` and `StringComparable<LanguageCode>`.
`equals()` compares complete canonical tags: `EN-us` equals `en-US`, but `en`
does not equal `en-US`. `compareTo()` and `compareToIgnoreCase()` order tags
lexicographically, not by language preference or specificity. Native `Map` and
`Set` still use object identity; use canonical `.code` strings as value keys.

## Development

```bash
pnpm --filter @blue/content build:lib
pnpm --filter @blue/content test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
