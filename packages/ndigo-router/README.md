# Ndigo Router

> Routing primitives for Ndigo — route construction, feature routing, route partitions, and query/matrix-string helpers.

Ndigo Router provides routing primitives for Ndigo: a `Route`/`PathRoute` model with pattern params (`:id`, `{id}`) plus query- and matrix-string parsing; a `Router` with interceptor/middleware chains (`router.use('/path/:id', handler)`); a `FeatureRoutingRegistry` for feature-scoped routing in micro-frontend shells (activate/lock routes per feature); a `PartitionRouter` for partition-prefixed route trees that isolate route namespaces; and an interceptor execution chain with include/exclude patterns.

## Installation

```bash
pnpm add @ndigo/router
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥12.

## Getting Started

```ts
import { Router } from '@ndigo/router';
import { QueryString } from '@ndigo/http';

const router = new Router();
router.use('/users/:id', (route) => {
    const id = route.resolveParam('id');
    const query = QueryString.parse(route.queryString);
});
```

## Usage

### Feature-scoped routing

```ts
import { FeatureRoutingRegistry } from '@ndigo/router';

const registry = new FeatureRoutingRegistry();
registry.registerFeature({
    name: 'todo',
    prefix: '/todo',
    onActivate: () => activateTodoFeature(),
    onRoute: (route) => renderTodoRoute(route),
});

registry.navigate('/todo/active'); // activates 'todo' and routes '/active'
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

## Development

```bash
pnpm --filter @ndigo/router build:lib
pnpm --filter @ndigo/router test
```

## See Also

- [@ndigo/http](../ndigo-http/README.md) — `URLSearchParams`-aligned query parsing
- [@ndigo/host](../ndigo-host/README.md) — shell orchestration that consumes the feature registry

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
