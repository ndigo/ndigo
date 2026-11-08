[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-condition](../README.md) / CompositeRouteCondition

# Class: CompositeRouteCondition

Implements the [RouteCondition](../interfaces/RouteCondition.md) contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.

When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`CompositeRouteCondition`\>

## Constructors

### Constructor

> **new CompositeRouteCondition**(...`routeConditions`): `CompositeRouteCondition`

Create a composite condition from one or more route conditions.

#### Parameters

##### routeConditions

[`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\>[] \| [`RouteConditionHolder`](RouteConditionHolder.md)[]

Conditions to combine.

#### Returns

`CompositeRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### routeConditions

> `readonly` **routeConditions**: [`RouteConditionHolder`](RouteConditionHolder.md)[]

The condition holders.

## Accessors

### conditions

#### Get Signature

> **get** **conditions**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\>[]

The unwrapped conditions.

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\>[]

***

### content

#### Get Signature

> **get** **content**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\>[]

The content parts (empty when no conditions).

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`unknown`\>[]

The condition's constituent parts.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

The conjunction separator.

##### Returns

`string`

The separator used when rendering the parts.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Whether the composite has no conditions.

##### Returns

`boolean`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### length

#### Get Signature

> **get** **length**(): `number`

The number of conditions.

##### Returns

`number`

## Methods

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Compare two composite conditions in route-specific context.

#### Parameters

##### value

`CompositeRouteCondition`

The condition to compare.

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

> **match**(`route`): `CompositeRouteCondition` \| `null`

Return the subset of conditions that match the route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`CompositeRouteCondition` \| `null`

A matching composite condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`match`](AbstractRouteCondition.md#match)

***

### merge()

> **merge**(`other`): `CompositeRouteCondition`

Merge two composite conditions element by element.

#### Parameters

##### other

`CompositeRouteCondition`

The condition to merge with.

#### Returns

`CompositeRouteCondition`

The merged composite condition.

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
