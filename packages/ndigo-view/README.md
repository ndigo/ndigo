# Ndigo View

> View contracts, view targets, and content-negotiation resolution for Ndigo — the contract layer between controllers and their representations.

View abstractions, view targets, and view resolution for Ndigo — the contract layer between controllers and their representations. `@ndigo/view` defines the view family and the resolution machinery that turns a logical view name into a rendered representation: view contracts (`View`, `AbstractView`, `ProducerView`), serializing views (`JSONView`, `CSVView`, `TextView`, `OctetStreamView`), view targets for fragment rendering, content-negotiation resolvers, and island support for Web Component islands.

## Installation

```bash
pnpm add @ndigo/view
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    PathExtensionContentNegotiationStrategy,
    JSONView,
    CSVView,
} from '@ndigo/view';
import { MediaTypes } from '@ndigo/core';

const manager = new ContentNegotiationManager([
    new PathExtensionContentNegotiationStrategy(
        new Map([
            ['json', MediaTypes.APPLICATION_JSON],
            ['csv', MediaTypes.TEXT_CSV],
        ])
    ),
]);
const resolver = new ContentNegotiationViewResolver(manager);
resolver.viewResolvers = [
    { resolveViewName: async (name) => (name === 'report' ? new JSONView() : null) },
    { resolveViewName: async (name) => (name === 'report' ? new CSVView({ records: 'rows' }) : null) },
];
```

## Usage

### Rendering a view directly

```ts
import { JSONView } from '@ndigo/view';

const view = new JSONView();
const result = await view.renderTo({ name: 'Ada', count: 3 }, route);
// result: { status, headers, body }
```

### Performance

Candidate aggregation is cached per (view name, language) — the `Promise.all` over delegate resolvers runs once per name, not per request. Only the media type selection reads the current request.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **View contracts** — `View`, `AbstractView`, `ProducerView` (a render produces `{ status, headers, body }`)
- **Serializing views** — `AbstractSerializingView` family: `JSONView`, `CSVView`, `TextView`, `OctetStreamView`
- **View targets** — `ViewTarget` abstraction for fragment rendering (DOM, HTTP response)
- **Resolution** — `ContentNegotiationManager` + strategies, `ContentNegotiationViewResolver`, path-based resolvers with per-name caching, `IslandViewResolver`/`IslandView`
- **Island first paint** — `IslandView` accepts trusted `shadowHtml` (author/design-system markup, never user input) rendered as a Declarative Shadow DOM `<template shadowrootmode="open">`, so the first paint shows real content before any script runs

## Development

```bash
pnpm --filter @ndigo/view build:lib
pnpm --filter @ndigo/view test
```

## See Also

- [@ndigo/view-ejs](../ndigo-view-ejs/README.md) — the EJS technology
- [@ndigo/view-webcomponent](../ndigo-view-webcomponent/README.md) — Web Component views
- [@ndigo/dispatcher](../ndigo-dispatcher/README.md) — dispatches and renders ModelAndView results

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
