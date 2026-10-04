[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / RouteMappingInfo

# Class: RouteMappingInfo

Contract for route matching conditions.

## Implements

- [`RouteCondition`](../interfaces/RouteCondition.md)\<`RouteMappingInfo`\>

## Constructors

### Constructor

> **new RouteMappingInfo**(`name?`, `patterns?`, `params?`, `matrix?`, `custom?`, `access?`, `method?`): `RouteMappingInfo`

Create route mapping metadata for a handler method.

#### Parameters

##### name?

`string` \| `null`

The mapping name.

##### patterns?

[`PatternsRouteCondition`](PatternsRouteCondition.md) = `...`

Pattern matching condition.

##### params?

[`QueryParamCondition`](QueryParamCondition.md) = `...`

Query-parameter matching condition.

##### matrix?

[`MatrixParamCondition`](MatrixParamCondition.md) = `...`

Matrix-parameter matching condition.

##### custom?

[`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\> \| `null`

Optional custom condition.

##### access?

[`AccessControlCondition`](AccessControlCondition.md) \| `null`

Optional access level (`'public'` or `'private'`).

##### method?

[`HTTPMethodCondition`](HTTPMethodCondition.md) = `...`

#### Returns

`RouteMappingInfo`

## Properties

### accessCondition

> `readonly` **accessCondition**: [`AccessControlCondition`](AccessControlCondition.md) \| `null`

Optional access-control condition (public vs. private routes).

***

### customConditionHolder

> `readonly` **customConditionHolder**: [`RouteConditionHolder`](RouteConditionHolder.md)

Custom condition wrapper.

***

### matrixCondition

> `readonly` **matrixCondition**: [`MatrixParamCondition`](MatrixParamCondition.md)

Matrix-parameter matching condition.

***

### methodCondition

> `readonly` **methodCondition**: [`HTTPMethodCondition`](HTTPMethodCondition.md)

HTTP method matching condition (any method when empty).

***

### name

> `readonly` **name**: `string`

Optional mapping name.

***

### patternsCondition

> `readonly` **patternsCondition**: [`PatternsRouteCondition`](PatternsRouteCondition.md)

Pattern matching condition.

***

### queryCondition

> `readonly` **queryCondition**: [`QueryParamCondition`](QueryParamCondition.md)

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

[`RouteCondition`](../interfaces/RouteCondition.md).[`compareTo`](../interfaces/RouteCondition.md#compareto)

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

[`RouteCondition`](../interfaces/RouteCondition.md).[`match`](../interfaces/RouteCondition.md#match)

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

[`RouteCondition`](../interfaces/RouteCondition.md).[`merge`](../interfaces/RouteCondition.md#merge)
