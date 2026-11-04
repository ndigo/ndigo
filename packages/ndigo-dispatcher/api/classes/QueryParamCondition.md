[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / QueryParamCondition

# Class: QueryParamCondition

A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in `RouteMapping`.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`QueryParamCondition`\>

## Constructors

### Constructor

> **new QueryParamCondition**(...`params`): `QueryParamCondition`

Create a parameter condition from one or more expressions.

#### Parameters

##### params

...`string`[]

Parameter expressions to parse.

#### Returns

`QueryParamCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

### Constructor

> **new QueryParamCondition**(`conditions`): `QueryParamCondition`

Create a parameter condition from a prebuilt expression set.

#### Parameters

##### conditions

`Set`\<[`QueryParamExpression`](QueryParamExpression.md)\>

The parameter expressions to use.

#### Returns

`QueryParamCondition`

#### Overrides

`AbstractRouteCondition<QueryParamCondition>.constructor`

## Properties

### expressions

> `readonly` **expressions**: `Set`\<[`QueryParamExpression`](QueryParamExpression.md)\>

Parameter expressions that must all match.

## Accessors

### content

#### Get Signature

> **get** **content**(): [`QueryParamExpression`](QueryParamExpression.md)[]

##### Returns

[`QueryParamExpression`](QueryParamExpression.md)[]

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

Compare parameter conditions by specificity.

#### Parameters

##### value

`QueryParamCondition`

The condition to compare.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

Unused, but part of the shared contract.

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

> **match**(`route`): `QueryParamCondition` \| `null`

Return this condition when every expression matches the route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`QueryParamCondition` \| `null`

This condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`match`](AbstractRouteCondition.md#match)

***

### merge()

> **merge**(`value`): `QueryParamCondition`

Merge parameter expressions from both conditions.

#### Parameters

##### value

`QueryParamCondition`

The condition to merge with.

#### Returns

`QueryParamCondition`

A condition containing the union of expressions.

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
