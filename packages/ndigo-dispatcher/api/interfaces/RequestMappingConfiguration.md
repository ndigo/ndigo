[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / RequestMappingConfiguration

# Interface: RequestMappingConfiguration

Configuration for the `requestMapping` decorator. Same shape as `RouteMappingConfiguration`
plus HTTP request semantics.

## Extends

- [`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md)

## Properties

### matrixParams?

> `optional` **matrixParams?**: `string`

Comma-separated matrix-parameter expressions that must all match for this
mapping to be selected.  Matrix parameters are per-path-segment key=value
pairs (e.g. `/products/42;color=red`).  Supported syntax is identical to
`params` above.

#### Inherited from

`RouteMappingConfiguration.matrixParams`

***

### method?

> `optional` **method?**: `HTTPMethod`

HTTP method this mapping handles; absent = any method.

#### Overrides

`RouteMappingConfiguration.method`

***

### name?

> `optional` **name?**: `string`

#### Inherited from

`RouteMappingConfiguration.name`

***

### path?

> `optional` **path?**: `string`

#### Inherited from

`RouteMappingConfiguration.path`

***

### private

> **private**: `boolean`

#### Inherited from

`RouteMappingConfiguration.private`

***

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

#### Inherited from

`RouteMappingConfiguration.queryParams`

***

### value

> **value**: `string`

#### Inherited from

`RouteMappingConfiguration.value`
