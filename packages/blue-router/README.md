# Blue Router

Blue Router provides routing primitives and hash-router implementations for BlueJS.

## Features

- `HashRouter` implementation
- Route/path abstractions (`Route`, `PathRoute`)
- Route pattern params (`:id`, `{id}`)
- Query-string and matrix-string helpers
- Interceptor registry for route execution
- Middleware shorthand (`router.use('/path/:id', (route) => { ... })`)

## Installation

```bash
pnpm add @blue/router
```

## Usage

```typescript
import { HashRouter, PathRoute } from '@blue/router';

const route = new PathRoute('/users/42/orders/abc');
const params = route.resolveParams('/users/:userId/orders/{orderId}');
// params.userId === '42'
// params.orderId === 'abc'

const router = new HashRouter((nextRoute) => {
    console.log('navigated to', nextRoute);
});

// Global middleware
router.use((activeRoute) => {
    console.log('pre-route', activeRoute.path);
    return true;
});

// Pattern middleware with automatic param binding
router.use('/teams/:teamId', (activeRoute) => {
    console.log(activeRoute.params.teamId);
    return true;
});
```

## Middleware and Params

`HashRouter#use` accepts both object interceptors and function middleware.

- `router.use(interceptor)` — global middleware
- `router.use('/users/:id', interceptor)` — mapped middleware for one pattern
- `router.use(['/a/*', '/b/*'], interceptor, ['/b/internal/*'])` — mapped middleware with exclusions

For mapped patterns, `route.params` is automatically populated when the pattern uses named params:

- Colon syntax: `:name`
- Brace syntax: `{name}`

## Development

```bash
pnpm --filter @blue/router build:lib
pnpm --filter @blue/router test
```
