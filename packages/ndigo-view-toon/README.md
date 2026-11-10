# @ndigo/view-toon

> TOON (Token-Oriented Object Notation) as an opt-in Ndigo view technology — `text/toon` output, a negotiation resolver, and a one-call prompt encoder.

TOON is a line-oriented encoding of the JSON data model, purpose-built for LLM
token economy. This package adds it as a view representation.

## Installation

```bash
pnpm add @ndigo/view-toon
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

Serve TOON as a second representation of one logical view name, registered
beside JSON:

```ts
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    JSONView,
    PathExtensionContentNegotiationStrategy,
} from '@ndigo/view';
import type { View, ViewResolver } from '@ndigo/view';
import { MediaTypes } from '@ndigo/core';
import { toonViewResolver } from '@ndigo/view-toon';

const staticResolver = (view: View): ViewResolver => ({ resolveViewName: async () => view });

const resolver = new ContentNegotiationViewResolver(
    new ContentNegotiationManager([
        // The app's own extension map: only entries an app registers are
        // negotiable as path extensions.
        new PathExtensionContentNegotiationStrategy(
            new Map([
                ['json', MediaTypes.APPLICATION_JSON],
                ['toon', MediaTypes.TEXT_TOON],
            ])
        ),
    ])
);
// JSON first — an unopinionated client keeps the default.
resolver.viewResolvers = [staticResolver(new JSONView()), toonViewResolver('report')];
```

## Usage

### Encoding a TOON document from a route

```ts
const result = await toonView.renderTo(rows, route); // `text/toon;charset=utf-8`
```

Tabular data — uniform arrays of objects — is where TOON pays: one field
header instead of a key repetition per row (`rows[2]{id,qty}: a,2 / b,5`).

### Composing a prompt fragment in-process

```ts
import { encodeToon } from '@ndigo/view-toon';

const document = encodeToon(rows, { delimiter: '\t' }); // sync; spec v4.4 syntax
```

TOON wins on uniform tabular payloads (≥2 KB); it is neutral or worse on small
nested objects — JSON stays the province of those.

### Opting in per route

TOON is never a default (AD-102): register `toonViewResolver` on the routes
that want it, and add a `'toon'` entry to your own path-extension map if you
want `GET /report.toon` to work. The framework's negotiation wiring registers
nothing for it; JSON remains what clients with no preference get.

## API

The full API is at [`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **`ToonView`** — a serializing view over `text/toon;charset=utf-8`
- **`toonViewResolver`** — a resolver serving `ToonView` for one logical view name
- **`encodeToon`** — the synchronous prompt-composition encoder

## Development

```bash
pnpm --filter @ndigo/view-toon build:lib
pnpm --filter @ndigo/view-toon test
```

## See Also

- [@ndigo/view](../ndigo-view/README.md) — view contracts, view targets, and content negotiation

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
