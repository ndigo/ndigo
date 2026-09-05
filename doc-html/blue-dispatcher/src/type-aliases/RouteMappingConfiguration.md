[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteMappingConfiguration

# Type Alias: RouteMappingConfiguration

> **RouteMappingConfiguration** = `RouteMappingValue` & `object`

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-25)

Configuration shape for route mappings.

`method` is optional — when absent the mapping matches any HTTP method.
It is normally set via `requestMapping` / `@getMapping` (see
`request-mapping.ts` / `http-method-mapping.ts`), not `routeMapping`
directly, but the shared metadata record carries it.

## Type Declaration

### name?

> `optional` **name?**: `string`

### method?

> `optional` **method?**: `HTTPMethod`

HTTP method this mapping handles; absent = any method.

### queryParams?

> `optional` **queryParams?**: `string`

Comma-separated query-parameter expressions that must all match for this
mapping to be selected.  Supported syntax per expression:
- `name` — parameter must be present
- `name=value` — parameter must equal the given value
- `!name` — parameter must be absent
- `name!=value` — parameter must not equal the given value

#### Examples

```ts
`queryParams: 'filter=active'`
```

```ts
`queryParams: 'filter=active, sort'`
```

### matrixParams?

> `optional` **matrixParams?**: `string`

Comma-separated matrix-parameter expressions that must all match for this
mapping to be selected.  Matrix parameters are per-path-segment key=value
pairs (e.g. `/products/42;color=red`).  Supported syntax is identical to
`params` above.

### private

> **private**: `boolean`

### path?

> `optional` **path?**: `string`
