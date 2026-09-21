# Blue Router

> Routing primitives for BlueJS — route construction, feature routing, route partitions, and query/matrix-string helpers.

Blue Router provides routing primitives for BlueJS: a `Route`/`PathRoute` model with pattern params (`:id`, `{id}`) plus query- and matrix-string parsing; a `Router` with interceptor/middleware chains (`router.use('/path/:id', handler)`); a `FeatureRoutingRegistry` for feature-scoped routing in micro-frontend shells (activate/lock routes per feature); a `PartitionRouter` for partition-prefixed route trees that isolate route namespaces; and an interceptor execution chain with include/exclude patterns.

## Installation

```bash
pnpm add @blue/router
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { Router, fromQueryString, toQueryString } from '@blue/router';

const router = new Router();
router.use('/users/:id', (route) => {
    const id = route.resolveParam('id');
    const query = fromQueryString(route.queryString);
});
```

## API

The full API is generated from JSDoc via `pnpm doc` into `doc-md/` and `doc-html/`. Primary exports live in [`src/index.ts`](src/index.ts); see the [package index](../README.md) for how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/router build:lib
pnpm --filter @blue/router test
```

## See Also

- [@blue/http](../blue-http/README.md) — `URLSearchParams`-aligned query parsing
- [@blue/host](../blue-host/README.md) — shell orchestration that consumes the feature registry

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
