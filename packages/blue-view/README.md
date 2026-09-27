# Blue View

> View contracts, view targets, and content-negotiation resolution for BlueJS — the contract layer between controllers and their representations.

View abstractions, view targets, and view resolution for BlueJS — the contract layer between controllers and their representations. `@blue/view` defines the view family and the resolution machinery that turns a logical view name into a rendered representation: view contracts (`View`, `AbstractView`, `ProducerView`), serializing views (`JSONView`, `CSVView`, `TextView`, `OctetStreamView`), view targets for fragment rendering, content-negotiation resolvers, and island support for Web Component islands.

## Installation

```bash
pnpm add @blue/view
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import {
    ContentNegotiationManager,
    ContentNegotiationViewResolver,
    PathExtensionContentNegotiationStrategy,
    JSONView,
    CSVView,
} from '@blue/view';
import { MediaTypes } from '@blue/core';

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

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

- **View contracts** — `View`, `AbstractView`, `ProducerView` (a render produces `{ status, headers, body }`)
- **Serializing views** — `AbstractSerializingView` family: `JSONView`, `CSVView`, `TextView`, `OctetStreamView`
- **View targets** — `ViewTarget` abstraction for fragment rendering (DOM, HTTP response)
- **Resolution** — `ContentNegotiationManager` + strategies, `ContentNegotiationViewResolver`, path-based resolvers with per-name caching, `IslandViewResolver`/`IslandView`

## Performance

Candidate aggregation is cached per (view name, language) — the `Promise.all` over delegate resolvers runs once per name, not per request. Only the media type selection reads the current request.

## Development

```bash
pnpm --filter @blue/view build:lib
pnpm --filter @blue/view test
```

## See Also

- [@blue/view-ejs](../blue-view-ejs/README.md) — the EJS technology
- [@blue/view-webcomponent](../blue-view-webcomponent/README.md) — Web Component views
- [@blue/dispatcher](../blue-dispatcher/README.md) — dispatches and renders ModelAndView results

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
