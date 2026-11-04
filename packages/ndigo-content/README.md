# Ndigo Content

> Content and theme abstractions for Ndigo — localized lookups, theme-aware rendering, and default-language fallback.

Ndigo Content defines content and theme abstractions used across Ndigo packages.

## Installation

```bash
pnpm add @ndigo/content
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```typescript
import { StaticContentSource, StaticThemeResolver, Theme } from '@ndigo/content';

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
import { LanguageCode } from '@ndigo/content';

new LanguageCode('EN-us').code; // 'en-US' — canonicalized
LanguageCode.for('en_us'); // null — invalid tags never become codes
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

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
pnpm --filter @ndigo/content build:lib
pnpm --filter @ndigo/content test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
