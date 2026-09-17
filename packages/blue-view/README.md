# Blue View

View abstractions, view targets, and view resolution for BlueJS — the
contract layer between controllers and their representations.

## Overview

`@blue/view` defines the view family and the resolution machinery that turns a
logical view name into a rendered representation:

- **View contracts** — `View`, `AbstractView`, and the `ProducerView` document
  contract (a render produces `{ status, headers, body }` a dispatcher writes
  directly — SSE and server-rendered pages)
- **Serializing views** — `AbstractSerializingView` family with ready-made
  `JSONView`, `CSVView`, `TextView`, `OctetStreamView` representations
- **View targets** — `ViewTarget` abstraction for fragment rendering (DOM
  targets, HTTP response targets)
- **Resolution** — view resolvers and composites, path-based resolver with
  per-name caching, and **content negotiation**:
    - `ContentNegotiationManager` + strategies (`PathExtensionContentNegotiationStrategy`,
      fixed strategies)
    - `ContentNegotiationViewResolver` — aggregates candidate views once per
      view name (cached) and negotiates the request's accepted media types per
      call
- **Island support** — `IslandViewResolver`/`IslandView` for Web Component
  islands in server-rendered pages

## Usage

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

## Performance

Candidate aggregation is cached per (view name, language) — the `Promise.all`
over delegate resolvers runs once per name, not per request. Only the media
type selection reads the current request.

## Development

```bash
pnpm --filter @blue/view build:lib
pnpm --filter @blue/view test
```

## See Also

- [@blue/view-ejs](../blue-view-ejs/README.md) — the EJS technology
- [@blue/view-webcomponent](../blue-view-webcomponent/README.md) — Web
  Component views
- [@blue/dispatcher](../blue-dispatcher/README.md) — dispatches and renders
  ModelAndView results
