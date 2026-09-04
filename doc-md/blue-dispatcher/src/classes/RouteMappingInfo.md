[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteMappingInfo

# Class: RouteMappingInfo

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:714

Contract for route matching conditions.

## Implements

- [`RouteCondition`](../interfaces/RouteCondition.md)\<`RouteMappingInfo`\>

## Constructors

### Constructor

> **new RouteMappingInfo**(`name?`, `patterns?`, `params?`, `matrix?`, `custom?`, `access?`, `method?`): `RouteMappingInfo`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:760

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

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\> \| `null`

Optional custom condition.

##### access?

[`AccessControlCondition`](AccessControlCondition.md) \| `null`

Optional access level (`'public'` or `'private'`).

##### method?

[`HTTPMethodCondition`](HTTPMethodCondition.md) = `...`

#### Returns

`RouteMappingInfo`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:718

Optional mapping name.

***

### patternsCondition

> `readonly` **patternsCondition**: [`PatternsRouteCondition`](PatternsRouteCondition.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:723

Pattern matching condition.

***

### queryCondition

> `readonly` **queryCondition**: [`QueryParamCondition`](QueryParamCondition.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:728

Query-parameter matching condition.

***

### matrixCondition

> `readonly` **matrixCondition**: [`MatrixParamCondition`](MatrixParamCondition.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:733

Matrix-parameter matching condition.

***

### methodCondition

> `readonly` **methodCondition**: [`HTTPMethodCondition`](HTTPMethodCondition.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:738

HTTP method matching condition (any method when empty).

***

### customConditionHolder

> `readonly` **customConditionHolder**: [`RouteConditionHolder`](RouteConditionHolder.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:743

Custom condition wrapper.

***

### accessCondition

> `readonly` **accessCondition**: [`AccessControlCondition`](AccessControlCondition.md) \| `null`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:748

Optional access-control condition (public vs. private routes).

## Methods

### merge()

> **merge**(`value`): `RouteMappingInfo`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:784

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

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `RouteMappingInfo` \| `null`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:807

Return a condition instance that matches the current route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteMappingInfo` \| `null`

A matching mapping info, or `null`.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`getMatchingCondition`](../interfaces/RouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route`): `number`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:857

Compare mapping info by parameter, pattern, and custom specificity.

#### Parameters

##### value

`RouteMappingInfo`

The mapping info to compare.

##### route

`Route`

The current route.

#### Returns

`number`

A comparison result.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`compareTo`](../interfaces/RouteCondition.md#compareto)
