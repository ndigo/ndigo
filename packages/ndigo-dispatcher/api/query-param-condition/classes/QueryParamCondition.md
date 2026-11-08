[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [query-param-condition](../README.md) / QueryParamCondition

# Class: QueryParamCondition

A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in `RouteMapping`.

## Extends

- [`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md)\<`QueryParamCondition`\>

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

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`constructor`](../../route-condition/classes/AbstractRouteCondition.md#constructor)

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

The condition's expressions.

##### Returns

[`QueryParamExpression`](QueryParamExpression.md)[]

The condition's constituent parts.

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`content`](../../route-condition/classes/AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

The conjunction separator.

##### Returns

`string`

The separator used when rendering the parts.

#### Overrides

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`infix`](../../route-condition/classes/AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`isEmpty`](../../route-condition/classes/AbstractRouteCondition.md#isempty)

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

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`compareTo`](../../route-condition/classes/AbstractRouteCondition.md#compareto)

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

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`equals`](../../route-condition/classes/AbstractRouteCondition.md#equals)

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

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`match`](../../route-condition/classes/AbstractRouteCondition.md#match)

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

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`merge`](../../route-condition/classes/AbstractRouteCondition.md#merge)

***

### toJSON()

> **toJSON**(): `JSONValue`

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`toJSON`](../../route-condition/classes/AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](../../route-condition/classes/AbstractRouteCondition.md).[`toString`](../../route-condition/classes/AbstractRouteCondition.md#tostring)
