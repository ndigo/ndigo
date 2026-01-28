[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteMappingInfo

# Class: RouteMappingInfo

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:398

## Implements

- [`RouteCondition`](../interfaces/RouteCondition.md)\<`RouteMappingInfo`\>

## Constructors

### Constructor

> **new RouteMappingInfo**(`name`, `patterns`, `params`, `custom`): `RouteMappingInfo`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:404

#### Parameters

##### name

`string` = `null`

##### patterns

[`PatternsRouteCondition`](PatternsRouteCondition.md) = `...`

##### params

[`ParamsRouteCondition`](ParamsRouteCondition.md) = `...`

##### custom

[`RouteCondition`](../interfaces/RouteCondition.md) = `null`

#### Returns

`RouteMappingInfo`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:399

***

### patternsCondition

> `readonly` **patternsCondition**: [`PatternsRouteCondition`](PatternsRouteCondition.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:400

***

### paramsCondition

> `readonly` **paramsCondition**: [`ParamsRouteCondition`](ParamsRouteCondition.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:401

***

### customConditionHolder

> `readonly` **customConditionHolder**: [`RouteConditionHolder`](RouteConditionHolder.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:402

## Methods

### merge()

> **merge**(`value`): `RouteMappingInfo`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:439

#### Parameters

##### value

`RouteMappingInfo`

#### Returns

`RouteMappingInfo`

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`merge`](../interfaces/RouteCondition.md#merge)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `RouteMappingInfo`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:448

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteMappingInfo`

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`getMatchingCondition`](../interfaces/RouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route`): `number`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:468

#### Parameters

##### value

`RouteMappingInfo`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`number`

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`compareTo`](../interfaces/RouteCondition.md#compareto)
