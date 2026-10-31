[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / AbstractRouteCondition

# Abstract Class: AbstractRouteCondition\<T\>

Contract for route matching conditions.

## Extended by

- [`RouteConditionHolder`](RouteConditionHolder.md)
- [`CompositeRouteCondition`](CompositeRouteCondition.md)
- [`AccessControlCondition`](AccessControlCondition.md)
- [`HTTPMethodCondition`](HTTPMethodCondition.md)
- [`QueryParamCondition`](QueryParamCondition.md)
- [`MatrixParamCondition`](MatrixParamCondition.md)
- [`PatternsRouteCondition`](PatternsRouteCondition.md)

## Type Parameters

### T

`T` *extends* `AbstractRouteCondition`\<`T`\>

## Implements

- `Equatable`
- [`RouteCondition`](../interfaces/RouteCondition.md)\<`T`\>
- `Serializable`

## Constructors

### Constructor

> **new AbstractRouteCondition**\<`T`\>(): `AbstractRouteCondition`\<`T`\>

#### Returns

`AbstractRouteCondition`\<`T`\>

## Properties

### content

> `abstract` **content**: `unknown`[]

***

### infix

> `abstract` **infix**: `string`

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Whether this condition contains no content.

##### Returns

`boolean`

## Methods

### compareTo()

> `abstract` **compareTo**(`value`, `route?`): `number`

Compare this condition with another condition.

#### Parameters

##### value

`T`

The condition to compare against.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route used to break ties, if needed.

#### Returns

`number`

A comparison result compatible with `Array.prototype.sort`.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`compareTo`](../interfaces/RouteCondition.md#compareto)

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

#### Implementation of

`Equatable.equals`

***

### match()

> `abstract` **match**(`route`): `T` \| `null`

Return the condition that matches a route, or `null` when no match exists.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`T` \| `null`

A matching condition instance or `null`.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`match`](../interfaces/RouteCondition.md#match)

***

### merge()

> `abstract` **merge**(`other`): `T`

Merge this condition with another condition of the same type.

#### Parameters

##### other

`T`

#### Returns

`T`

The merged condition.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`merge`](../interfaces/RouteCondition.md#merge)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Implementation of

`Serializable.toString`
