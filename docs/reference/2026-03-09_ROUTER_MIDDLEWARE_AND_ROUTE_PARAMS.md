# Router Middleware and Route Params Reference

This reference documents the current middleware and route-parameter behavior in `@blue/router`.

## Summary

`@blue/router` supports:

- Interceptor-style middleware (`RouterInterceptor`)
- Function middleware shorthand (`RouterMiddleware`)
- Mapped middleware by route pattern
- Automatic named route-parameter binding on `route.params`

Browser hash routing (`HashRouter`) lives in `@blue/platform-web`
(`hash-router.ts`) and extends `@blue/router`'s platform-neutral
`AbstractRouter` — it is not part of `@blue/router` itself.

## Route Params

`PathRoute` instances provide explicit parameter extraction methods:

- `resolveParams(pattern: string): Record<string, string> | null`
- `matches(pattern: string): boolean` — true when `resolveParams` returns non-null

Supported parameter styles:

- Colon style: `/users/:userId/orders/:orderId`
- Brace style: `/users/{userId}/orders/{orderId}`

When `resolveParams` matches, values are exposed on `route.params`.

## Router Middleware API (`use`)

Every `AbstractRouter` implementation — including `@blue/platform-web`'s
`HashRouter` — exposes `use` in three forms:

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
- Non-named (glob) patterns are matched through `URLGlobPathMatcher` from
  `@blue/core` (`*` / `**` segments; compiled patterns are LRU-cached).
- Exclusion patterns are evaluated before inclusion patterns for mapped middleware.

## Execution Behavior

- `preHandle` runs in registration order; returning `false` (or a function
  middleware returning `false`) aborts the route change (short-circuit).
- `postHandle` and `afterCompletion` run in reverse registration order;
  `postHandle` runs after the route is committed, `afterCompletion` always
  runs — also for rejected or failed route changes.

## Notes for Dispatcher Integration

The router-level `route.params` feeds the dispatcher's `pathVariable()`
argument resolver — no name binds the whole params record, a name binds one
segment.
