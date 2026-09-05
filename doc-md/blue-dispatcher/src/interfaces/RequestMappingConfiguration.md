[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RequestMappingConfiguration

# Interface: RequestMappingConfiguration

Defined in: [packages/blue-dispatcher/src/request-mapping.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/request-mapping.ts#lines-22)

Configuration for the `requestMapping` decorator. Same shape as `RouteMappingConfiguration`
plus HTTP request semantics.

## Extends

- [`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md)

## Properties

### method?

> `optional` **method?**: `HTTPMethod`

Defined in: [packages/blue-dispatcher/src/request-mapping.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/request-mapping.ts#lines-24)

HTTP method this mapping handles; absent = any method.

#### Overrides

`RouteMappingConfiguration.method`

***

### value

> **value**: `string`

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-14)

#### Inherited from

`RouteMappingConfiguration.value`

***

### name?

> `optional` **name?**: `string`

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-26)

#### Inherited from

`RouteMappingConfiguration.name`

***

### queryParams?

> `optional` **queryParams?**: `string`

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-40)

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

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-47)

Comma-separated matrix-parameter expressions that must all match for this
mapping to be selected.  Matrix parameters are per-path-segment key=value
pairs (e.g. `/products/42;color=red`).  Supported syntax is identical to
`params` above.

#### Inherited from

`RouteMappingConfiguration.matrixParams`

***

### private

> **private**: `boolean`

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-48)

#### Inherited from

`RouteMappingConfiguration.private`

***

### path?

> `optional` **path?**: `string`

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-49)

#### Inherited from

`RouteMappingConfiguration.path`
