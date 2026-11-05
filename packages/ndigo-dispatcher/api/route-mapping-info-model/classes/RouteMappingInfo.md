[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-mapping-info-model](../README.md) / RouteMappingInfo

# Class: RouteMappingInfo

Contract for route matching conditions.

## Implements

- [`RouteCondition`](../../route-condition/interfaces/RouteCondition.md)\<`RouteMappingInfo`\>

## Constructors

### Constructor

> **new RouteMappingInfo**(`name?`, `patterns?`, `params?`, `matrix?`, `custom?`, `access?`, `method?`): `RouteMappingInfo`

Create route mapping metadata for a handler method.

#### Parameters

##### name?

`string` \| `null` = `null`

The mapping name.

##### patterns?

[`PatternsRouteCondition`](../../patterns-route-condition/classes/PatternsRouteCondition.md) = `...`

Pattern matching condition.

##### params?

[`QueryParamCondition`](../../query-param-condition/classes/QueryParamCondition.md) = `...`

Query-parameter matching condition.

##### matrix?

[`MatrixParamCondition`](../../matrix-param-condition/classes/MatrixParamCondition.md) = `...`

Matrix-parameter matching condition.

##### custom?

[`RouteCondition`](../../route-condition/interfaces/RouteCondition.md)\<`unknown`\> \| `null` = `null`

Optional custom condition.

##### access?

[`AccessControlCondition`](../../access-control-condition/classes/AccessControlCondition.md) \| `null` = `null`

Optional access level (`'public'` or `'private'`).

##### method?

[`HTTPMethodCondition`](../../http-method-condition/classes/HTTPMethodCondition.md) = `...`

#### Returns

`RouteMappingInfo`

## Properties

### accessCondition

> `readonly` **accessCondition**: [`AccessControlCondition`](../../access-control-condition/classes/AccessControlCondition.md) \| `null`

Optional access-control condition (public vs. private routes).

***

### customConditionHolder

> `readonly` **customConditionHolder**: [`RouteConditionHolder`](../../route-condition/classes/RouteConditionHolder.md)

Custom condition wrapper.

***

### matrixCondition

> `readonly` **matrixCondition**: [`MatrixParamCondition`](../../matrix-param-condition/classes/MatrixParamCondition.md)

Matrix-parameter matching condition.

***

### methodCondition

> `readonly` **methodCondition**: [`HTTPMethodCondition`](../../http-method-condition/classes/HTTPMethodCondition.md)

HTTP method matching condition (any method when empty).

***

### name

> `readonly` **name**: `string`

Optional mapping name.

***

### patternsCondition

> `readonly` **patternsCondition**: [`PatternsRouteCondition`](../../patterns-route-condition/classes/PatternsRouteCondition.md)

Pattern matching condition.

***

### queryCondition

> `readonly` **queryCondition**: [`QueryParamCondition`](../../query-param-condition/classes/QueryParamCondition.md)

Query-parameter matching condition.

## Methods

### compareTo()

> **compareTo**(`value`, `route`): `number`

Compare mapping info by parameter, pattern, and custom specificity.

#### Parameters

##### value

`RouteMappingInfo`

The mapping info to compare.

##### route

[`Route`](#)

The current route.

#### Returns

`number`

A comparison result.

#### Implementation of

[`RouteCondition`](../../route-condition/interfaces/RouteCondition.md).[`compareTo`](../../route-condition/interfaces/RouteCondition.md#compareto)

***

### match()

> **match**(`route`): `RouteMappingInfo` \| `null`

Return a condition instance that matches the current route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`RouteMappingInfo` \| `null`

A matching mapping info, or `null`.

#### Implementation of

[`RouteCondition`](../../route-condition/interfaces/RouteCondition.md).[`match`](../../route-condition/interfaces/RouteCondition.md#match)

***

### merge()

> **merge**(`value`): `RouteMappingInfo`

Merge this mapping info with another.

#### Parameters

##### value

`RouteMappingInfo`

The mapping info to merge with.

#### Returns

`RouteMappingInfo`

The merged mapping info.

#### Implementation of

[`RouteCondition`](../../route-condition/interfaces/RouteCondition.md).[`merge`](../../route-condition/interfaces/RouteCondition.md#merge)

***

### method()

> **method**(): `HTTPMethod` \| `undefined`

The required HTTP method, or `undefined` when the mapping matches any
method.

Public read model for mapping inspection (`@ndigo/inspect` via the
`getMappingEntries()` seam): consumers MUST NOT reach into the
`methodCondition` internal condition to read it.

#### Returns

`HTTPMethod` \| `undefined`

The fixed method, or `undefined` for an any-method mapping.

***

### patterns()

> **patterns**(): `string`[]

The route patterns this mapping matches, in registration order.

Public read model for mapping inspection (`@ndigo/inspect` via the
`getMappingEntries()` seam): consumers MUST NOT reach into the
`patternsCondition` internal condition to read them.

#### Returns

`string`[]

A fresh array of the mapping's patterns.
