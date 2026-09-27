[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / MatrixParamCondition

# Class: MatrixParamCondition

A logical conjunction ('&&') route condition that matches a route against
a set of matrix-parameter expressions.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`MatrixParamCondition`\>

## Constructors

### Constructor

> **new MatrixParamCondition**(...`params`): `MatrixParamCondition`

Create a matrix-parameter condition from one or more expressions.

#### Parameters

##### params

...`string`[]

Matrix-parameter expressions to parse.

#### Returns

`MatrixParamCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

### Constructor

> **new MatrixParamCondition**(`conditions`): `MatrixParamCondition`

Create a matrix-parameter condition from a prebuilt expression set.

#### Parameters

##### conditions

`Set`\<[`MatrixParamExpression`](MatrixParamExpression.md)\>

The matrix-parameter expressions to use.

#### Returns

`MatrixParamCondition`

#### Overrides

`AbstractRouteCondition<MatrixParamCondition>.constructor`

## Properties

### expressions

> `readonly` **expressions**: `Set`\<[`MatrixParamExpression`](MatrixParamExpression.md)\>

Matrix-parameter expressions that must all match.

## Accessors

### content

#### Get Signature

> **get** **content**(): [`MatrixParamExpression`](MatrixParamExpression.md)[]

##### Returns

[`MatrixParamExpression`](MatrixParamExpression.md)[]

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

Compare matrix-parameter conditions by specificity.

#### Parameters

##### value

`MatrixParamCondition`

The condition to compare.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

Unused, part of the shared contract.

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

### getMatchingCondition()

> **getMatchingCondition**(`route`): `MatrixParamCondition` \| `null`

Return this condition when every expression matches the route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`MatrixParamCondition` \| `null`

This condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### merge()

> **merge**(`value`): `MatrixParamCondition`

Merge matrix-parameter expressions from both conditions.

#### Parameters

##### value

`MatrixParamCondition`

The condition to merge with.

#### Returns

`MatrixParamCondition`

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
