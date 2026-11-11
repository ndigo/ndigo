# Guide 05 — Routing & Route Conditions

A route is the value every Ndigo handler receives. It carries the path, the
method, query and matrix data, parsed parameters, headers/cookies/body, and an
attribute bag. Routing is the two-step decision that turns an incoming path into
a handler: match the path, then match the conditions.

This guide covers the path grammar, the mapping decorators, the condition
builders, precedence and 404/405 behavior, and the router primitives used by
browser shells.

**Audience:** Node and browser application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) (Node) or [guide 02](02-building-a-browser-app.md) (browser) · **Reference app:** `[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)`, `[apps/09-ndigo-httpbin](https://github.com/ndigo/ndigo/tree/main/apps/09-ndigo-httpbin)`

## What you'll learn

- Write path patterns with `:id`, `{id}`, and `{*rest}`.
- Compose class-level and method-level mappings.
- Gate a mapping on query, matrix, method, and access conditions.
- Predict which mapping wins when several match.
- Use `Router`, `PartitionRouter`, and `FeatureRoutingRegistry` in a shell.

## 1. The route value

`PathRoute` implements the platform-neutral `Route` contract. It parses the
path into segments (each with its own matrix data) and exposes the query string,
params, method, and attributes:

```ts
import { PathRoute } from '@ndigo/router';

const route = new PathRoute('/products/42;color=red?filter=active');
route.path; // '/products/42;color=red'
route.resolveParams('/products/:id'); // { id: '42' }
route.data; // parsed query/matrix data
```

The same contract is produced by the Node HTTP adapter and the browser router.
Handlers and interceptors read it; they do not construct it.

## 2. Path patterns

Three segment forms are supported:

| Pattern | Matches | Params |
| ----------------- | -------------------------------------- | ---------- |
| `/users/:id` | one segment | `{ id }` |
| `/users/{id}` | one segment (brace form) | `{ id }` |
| `/assets/{*file}` | the rest of the path, slashes included | `{ file }` |

`resolveParams(pattern)` returns `null` when the segment count does not match.
Wildcards are greedy and must be the last segment. Trailing-slash spelling is
normalized (`/foo` and `/foo/` share one radix node), so choose one spelling for
your own links and expect both to resolve.

Query and matrix data are parsed into `route.data`; use `queryValue` /
`matrixValue` (guide 06) rather than reading it by hand in a handler.

## 3. Mapping decorators

A handler is declared with a verb decorator or a method-agnostic
`@requestMapping`:

```ts
import { getMapping, postMapping, requestMapping } from '@ndigo/dispatcher';

@requestMapping('/api') // class-level path context
class ProductController {
    @getMapping('/products/:id')
    getProduct(route: Route) {
        return { id: route.resolveParams('/products/:id')?.id };
    }

    @postMapping('/products')
    createProduct() {
        return { created: true };
    }

    @requestMapping({ value: '/products/search', method: 'QUERY' })
    searchProducts() {
        return { items: [] };
    }
}
```

Class-level and method-level mappings compose: the class value is the prefix,
the method value is appended. `@getMapping` and friends are method-only; a
class-level verb mapping is a configuration error. `@requestMapping` accepts any
method (including the RFC 9889 `QUERY` method).

## 4. Conditions

Conditions narrow a mapping beyond the path. They are declared on the mapping
configuration:

```ts
import { getMapping, queryParamCondition, matrixParamCondition } from '@ndigo/dispatcher';

@getMapping({
    value: '/products',
    queryParams: 'filter=active, sort',
})
listActive() {
    return { items: [] };
}

@getMapping({
    value: '/products/:id',
    matrixParams: matrixParamCondition('color', 'red'),
})
getRedProduct() {
    return { product: null };
}
```

| Condition | Configuration | Expression syntax |
| ------------- | --------------------------- | -------------------------------------------- |
| Query params | `queryParams` | `name`, `name=value`, `!name`, `name!=value` |
| Matrix params | `matrixParams` | same syntax, per path segment |
| HTTP method | `method` / verb decorator | fixed by the decorator |
| Access | `private` (default `false`) | public vs private mapping |

Multiple expressions are comma-separated and must **all** match. The builders
(`queryParamCondition`, `matrixParamCondition`) produce the same strings with
options for negation and case sensitivity. Conditions are part of the mapping
identity: two handlers may share a path and differ by query/matrix/method.

## 5. Precedence, 404, and 405

The Node dispatcher uses a radix tree plus a candidate list per canonical
pattern:

1. The tree finds the path node and extracts path params.
2. Candidates for that pattern are filtered by query, matrix, and method
 conditions.
3. When several remain, the most specific mapping wins (`compareTo`); ties keep
 the first registration.
4. No path match → **404**. Path exists but no candidate accepts the method →
 **405** with an `Allow` header (OPTIONS is exempt and reaches the
 interceptors). No view for a resolved handler → **404**.

This is why two mappings on the same path are safe: differ by a condition and
the dispatcher picks the right one deterministically. Do not rely on
registration order when the conditions do not distinguish the mappings.

## 6. Routers, partitions, and features

`@ndigo/router` provides the browser-side primitives. A `Router` runs
interceptor/middleware chains with include/exclude patterns:

```ts
import { Router } from '@ndigo/router';

const router = new Router();
router.use('/users/:id', (route) => {
    const id = route.resolveParams('/users/:id')?.id;
    return renderUser(id);
});
```

For a shell with feature partitions, `PartitionRouter` mounts a feature at a
prefix and passes it the stripped route; `FeatureRoutingRegistry` layers
activation policy (exclusive/shared) and lifecycle callbacks on top:

```ts
import { FeatureRoutingRegistry } from '@ndigo/router';

const registry = new FeatureRoutingRegistry();
registry.registerFeature({
    name: 'todo',
    prefix: '/todo',
    onActivate: () => mountTodo(),
    onRoute: (route) => renderTodo(route),
});

registry.navigate('/todo/active'); // activates 'todo', routes '/active'
```

Use `FeatureRoutingRegistry` with `@ndigo/host` (guide 31) when features are
separate contexts. A plain browser app usually needs only the web preset's
router (guide 02).

## 7. Pitfalls

- **Verb decorators are method-only.** Put the shared prefix on the class with
 `@requestMapping`.
- **Wildcards must be last.** `{*file}` cannot be followed by another segment.
- **Conditions are ANDed.** A comma means "all", not "any".
- **405 is not 404.** A method mismatch keeps the path and returns `Allow`;
 do not add a catch-all handler that masks it.
- **Trailing-slash spelling is normalized.** Do not register both spellings
 expecting different handlers.
- **Access `private` is routing metadata, not authentication.** Role checks
 live in `@ndigo/auth-server` (guide 26).

## See also

- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — the shell router
- [Guide 06 — Argument Binding](06-argument-binding.md) — reading path/query/matrix values
- [Guide 08 — Errors & Problem Details](08-errors-and-problem-details.md) — 404/405/406 shapes
- [`@ndigo/router`](../../packages/ndigo-router/README.md) — `Route`, `Router`, partitions
- [`@ndigo/dispatcher`](../../packages/ndigo-dispatcher/README.md) — mappings and conditions
- and — partitioning and registry decisions
