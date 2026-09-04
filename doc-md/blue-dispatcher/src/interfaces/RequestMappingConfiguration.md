[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RequestMappingConfiguration

# Interface: RequestMappingConfiguration

Defined in: packages/blue-dispatcher/src/request-mapping.ts:22

Configuration for `@requestMapping`. Same shape as `RouteMappingConfiguration`
plus HTTP request semantics.

## Extends

- [`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md)

## Properties

### method?

> `optional` **method?**: `HTTPMethod`

Defined in: packages/blue-dispatcher/src/request-mapping.ts:24

HTTP method this mapping handles; absent = any method.

#### Overrides

`RouteMappingConfiguration.method`

***

### value

> **value**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping.ts:14

#### Inherited from

`RouteMappingConfiguration.value`

***

### name?

> `optional` **name?**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping.ts:26

#### Inherited from

`RouteMappingConfiguration.name`

***

### queryParams?

> `optional` **queryParams?**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping.ts:40

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

#### Inherited from

`RouteMappingConfiguration.queryParams`

***

### matrixParams?

> `optional` **matrixParams?**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping.ts:47

Comma-separated matrix-parameter expressions that must all match for this
mapping to be selected.  Matrix parameters are per-path-segment key=value
pairs (e.g. `/products/42;color=red`).  Supported syntax is identical to
`params` above.

#### Inherited from

`RouteMappingConfiguration.matrixParams`

***

### private

> **private**: `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping.ts:48

#### Inherited from

`RouteMappingConfiguration.private`

***

### path?

> `optional` **path?**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping.ts:49

#### Inherited from

`RouteMappingConfiguration.path`
