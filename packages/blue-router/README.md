# Blue Router

Routing primitives for BlueJS: route construction, feature routing, route
partitions, and query/matrix-string helpers.

## Features

- **Route model** — `Route`/`PathRoute` with pattern params (`:id`, `{id}`),
  query-string and matrix-string parsing
- **`Router`** — router with interceptor/middleware chains
  (`router.use('/path/:id', handler)`)
- **`FeatureRoutingRegistry`** — feature-scoped routing for micro frontend
  shells (activate/lock routes per feature)
- **`PartitionRouter`** — partition-prefixed route trees for isolating route
  namespaces
- **Interceptors** — router execution chain with include/exclude patterns

## Usage

```ts
import { Router, fromQueryString, toQueryString } from '@blue/router';

const router = new Router();
router.use('/users/:id', (route) => {
    const id = route.resolveParam('id');
    const query = fromQueryString(route.queryString);
});
```

## See Also

- [@blue/http](../blue-http/README.md) — `URLSearchParams`-aligned query
  parsing
- [@blue/host](../../packages/blue-host/README.md) — shell orchestration that
  consumes the feature registry