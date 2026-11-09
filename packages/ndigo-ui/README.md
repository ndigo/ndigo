# Ndigo UI

> The Ndigo design system: brand tokens, an opt-in base layer, and the typed contract behind every `--nd-*` custom property.

`@ndigo/ui` is the package half of the Ndigo design system. It ships the
canonical token stylesheet, the base layer that applies those tokens to native
elements, and a typed token catalog that documentation, tests, and tooling
share. Components are not imported from this package — they are installed as
copy-in source from the Ndigo registry, so an application owns every line it
runs.

## Installation

```bash
pnpm add @ndigo/ui
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

Import the tokens first, then the optional base layer:

```css
@import '@ndigo/ui/tokens.css';
@import '@ndigo/ui/theme.css';
```

The tokens expose `--nd-*` custom properties for the brand palette, semantic
colors, typography, spacing, radius, elevation, motion, stacking order, and
focus. Dark mode is the default; set `data-theme="light"` on the root element
for the light palette, or omit it to follow the operating system.

## Usage

### Tokens

Consume tokens directly in CSS:

```css
.card {
    background: var(--nd-color-surface);
    border: 1px solid var(--nd-color-border);
    border-radius: var(--nd-radius-md);
    box-shadow: var(--nd-shadow-md);
    padding: var(--nd-space-4);
}
```

### Typed catalog

The catalog mirrors the stylesheet and is useful for docs, tooling, and
autocomplete:

```ts
import { getTokenDefinition, resolveToken, TOKENS } from '@ndigo/ui';

TOKENS.length; // one entry per token declared in the stylesheet
getTokenDefinition('--nd-color-bg')?.group; // 'color'
resolveToken('--nd-space-4', '1rem'); // 'var(--nd-space-4, 1rem)'
```

### Base layer

`@ndigo/ui/theme.css` is opt-in. It styles native elements (page background,
headings, code, links, focus rings, reduced motion) and adds the `.nd-gradient-text`,
`.nd-gradient-bg`, and `.nd-mark` brand utilities. Applications that already
have their own base styles can import only the token stylesheet.

### Registry

The package directory is a shadcn-compatible registry chunk included by the
repository root `registry.json`. The `theme` item distributes the token and
base stylesheets; `lib` carries the copy-in custom-element foundation,
`button`, `input`, `field`, and `checkbox` are the native-first CSS items,
`dialog`, `menu`, `popover`, `tooltip`, `tabs`, `accordion`, `switch`, `slider`,
`select`, `combobox`, and `drawer` are the behaviour items built on Zag.js; `toast` is the native-first
live region, and `app-shell` and `command` are the blocks.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for how
it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/ui build:lib
pnpm --filter @ndigo/ui test
```

The token test suite enforces that the stylesheet and the typed catalog stay
in lockstep, that dark and light declare the same semantic colors, and that
the stylesheet remains free of imports, font files, and element selectors.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
