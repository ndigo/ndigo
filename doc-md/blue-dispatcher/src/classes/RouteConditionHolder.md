[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteConditionHolder

# Class: RouteConditionHolder

Defined in: packages/blue-dispatcher/src/route-condition.ts:186

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`RouteConditionHolder`\>

## Constructors

### Constructor

> **new RouteConditionHolder**(`routeCondition`): `RouteConditionHolder`

Defined in: packages/blue-dispatcher/src/route-condition.ts:197

#### Parameters

##### routeCondition

[`RouteCondition`](../interfaces/RouteCondition.md) = `null`

#### Returns

`RouteConditionHolder`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### condition

> `readonly` **condition**: [`RouteCondition`](../interfaces/RouteCondition.md)

Defined in: packages/blue-dispatcher/src/route-condition.ts:187

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:133

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### content

#### Get Signature

> **get** **content**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:189

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:193

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

## Methods

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:140

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-dispatcher/src/route-condition.ts:150

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:154

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)

***

### merge()

> **merge**(`other`): `RouteConditionHolder`

Defined in: packages/blue-dispatcher/src/route-condition.ts:212

Combine the route conditions held by the two RouteConditionHolder instances after making sure the conditions are of the same type. Or if one holder is empty, the other holder is returned.
    *

#### Parameters

##### other

`RouteConditionHolder`

#### Returns

`RouteConditionHolder`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `RouteConditionHolder`

Defined in: packages/blue-dispatcher/src/route-condition.ts:225

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`RouteConditionHolder`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:233

#### Parameters

##### value

`RouteConditionHolder`

##### route?

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`number`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
