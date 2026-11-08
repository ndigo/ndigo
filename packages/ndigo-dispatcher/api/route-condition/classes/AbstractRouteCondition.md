[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-condition](../README.md) / AbstractRouteCondition

# Abstract Class: AbstractRouteCondition\<T\>

Contract for route matching conditions.

## Extended by

- [`AccessControlCondition`](../../access-control-condition/classes/AccessControlCondition.md)
- [`HTTPMethodCondition`](../../http-method-condition/classes/HTTPMethodCondition.md)
- [`MatrixParamCondition`](../../matrix-param-condition/classes/MatrixParamCondition.md)
- [`PatternsRouteCondition`](../../patterns-route-condition/classes/PatternsRouteCondition.md)
- [`QueryParamCondition`](../../query-param-condition/classes/QueryParamCondition.md)
- [`RouteConditionHolder`](RouteConditionHolder.md)
- [`CompositeRouteCondition`](CompositeRouteCondition.md)

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

The condition's constituent parts.

***

### infix

> `abstract` **infix**: `string`

The separator used when rendering the parts.

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

Compares this condition with another.

#### Parameters

##### value

`T`

The condition to compare.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

Optional tie-breaking route.

#### Returns

`number`

The comparison result.

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

Matches the condition against a route.

#### Parameters

##### route

[`Route`](#)

The route to match.

#### Returns

`T` \| `null`

The matching condition, or `null`.

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`match`](../interfaces/RouteCondition.md#match)

***

### merge()

> `abstract` **merge**(`other`): `T`

Merges this condition with another.

#### Parameters

##### other

`T`

The condition to merge with.

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
