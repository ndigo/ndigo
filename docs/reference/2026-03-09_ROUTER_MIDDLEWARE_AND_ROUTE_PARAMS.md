# Router Middleware and Route Params Reference

This reference documents the current middleware and route-parameter behavior in `@blue/router`.

## Summary

`@blue/router` supports:

- Hash-based routing via `HashRouter`
- Interceptor-style middleware (`RouterInterceptor`)
- Function middleware shorthand (`RouterMiddleware`)
- Mapped middleware by route pattern
- Automatic named route-parameter binding on `route.params`

## Route Params

`PathRoute` provides explicit parameter extraction utilities:

- `resolveParams(pattern: string): JSONObject | null`
- `matches(pattern: string): boolean`

Supported parameter styles:

- Colon style: `/users/:userId/orders/:orderId`
- Brace style: `/users/{userId}/orders/{orderId}`

When `resolveParams` matches, values are exposed on `route.params`.

## HashRouter Middleware API

`HashRouter#use` supports three forms:

1. Global middleware:

```typescript
router.use((route) => {
    // called for every route change
    return true;
});
```

2. Single-pattern middleware:

```typescript
router.use('/teams/:teamId', (route) => {
    // route.params.teamId is available
    return true;
});
```

3. Multi-pattern middleware with optional exclusions:

```typescript
router.use(['/admin/*', '/ops/*'], interceptor, ['/admin/internal/*']);
```

## Matching Semantics

- Named patterns (`:id`, `{id}`) are matched against route segments and bind values to `route.params`.
- Non-named patterns are matched through `GlobPathMatcher`.
- Exclusion patterns are evaluated before inclusion patterns for mapped middleware.

## Execution Behavior

- Middleware runs in registration order.
- `preRoute(route) === false` aborts route application.
- `postRoute(route)` runs after successful route updates.

## Notes for Dispatcher Integration

The router-level `route.params` is now suitable as a source for future dispatcher argument resolvers that consume path variables.
