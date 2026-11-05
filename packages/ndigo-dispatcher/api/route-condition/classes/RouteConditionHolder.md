[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-condition](../README.md) / RouteConditionHolder

# Class: RouteConditionHolder

The discrete items a route condition is composed of, e.g. URL patterns, param expressions, etc.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`RouteConditionHolder`\>

## Constructors

### Constructor

> **new RouteConditionHolder**(`routeCondition?`): `RouteConditionHolder`

Create a holder for an optional condition.

#### Parameters

##### routeCondition?

[`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\> \| `null` = `null`

The wrapped condition, if any.

#### Returns

`RouteConditionHolder`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### condition

> `readonly` **condition**: [`RouteCondition`](../interfaces/RouteCondition.md)

Wrapped condition, when present.

## Accessors

### content

#### Get Signature

> **get** **content**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\>[]

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\>[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

## Methods

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Compare two holders by comparing their wrapped conditions.

#### Parameters

##### value

`RouteConditionHolder`

The holder to compare.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route used to break ties, if needed.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)

***

### equals()

> **equals**(`value`): `boolean`

Compare this condition to another value.

#### Parameters

##### value

`unknown`

The value to compare.

#### Returns

`boolean`

`true` when both conditions are equivalent.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### match()

> **match**(`route`): `RouteConditionHolder` \| `null`

Return a holder for the wrapped condition when it matches the route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`RouteConditionHolder` \| `null`

A matching holder, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`match`](AbstractRouteCondition.md#match)

***

### merge()

> **merge**(`other`): `RouteConditionHolder`

Merge two holders, preserving empty holders when possible.

#### Parameters

##### other

`RouteConditionHolder`

The holder to merge with.

#### Returns

`RouteConditionHolder`

A merged holder.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)
