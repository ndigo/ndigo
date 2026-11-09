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
repository root `registry.json`. The registry currently has 41 items:

- **Foundation:** `theme` (tokens plus the opt-in base layer) and `lib` (the
  copy-in custom-element foundation).
- **Native-first CSS:** `button`, `input`, `field`, `checkbox`, `table`,
  `alert`, `badge`, `card`, `separator`, `skeleton`, `spinner`, `breadcrumb`,
  `kbd`, `aspect-ratio`, `item`, `typography`, `pagination`; `toast` is a
  native-first live region.
- **Behaviour (Zag.js):** `dialog`, `menu`, `popover`, `tooltip`, `tabs`,
  `accordion`, `switch`, `slider`, `select`, `combobox`, `drawer`,
  `date-picker`, `scroll-area`, `navigation-menu`, `tags-input`, `file-upload`.
- **Blocks:** `app-shell`, `command`, `data-table` (table + checkbox + button +
  pagination), `code-block`, `sidebar`.

Browse the catalogue at [ndigo.dev/ui](https://ndigo.dev/ui) once the site is
deployed. External applications install items with the shadcn namespace
(`@ndigo/<item>` after
pointing `registries` at `https://ndigo.dev/r/{name}.json`) or a direct
`https://ndigo.dev/r/<item>.json` URL; monorepo apps and the lab use
`ndigo ui add`. `ndigo ui mcp` exposes the same registry to MCP clients for
discovery and installation.

### Attribute reactivity

State attributes are live: changing `open`, `checked`, `disabled`, `readonly`,
`required`, `invalid`, `name`, `value`, `min`, `max`, `step`, `locale`,
`accept`, `max-files`, `max-file-size`, `min-file-size`, `delimiter`,
`placeholder`, `add-on-paste`, `blur-behavior`, `orientation`, `placement`, or
the navigation-menu delay/disable flags on a connected element updates the
running machine.

Structural attributes are read when the element connects: `trigger-label`,
`initial-focus`, and the authored collection markup (`[data-part="item"]`).
Change those before connecting, or recreate the element. Generated element ids
are stable across disconnects, so moving an element in the DOM keeps its
`aria-*` wiring intact.

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
