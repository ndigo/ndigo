[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MatrixParamCondition

# Class: MatrixParamCondition

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:299

A logical conjunction ('&&') route condition that matches a route against
a set of matrix-parameter expressions.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`MatrixParamCondition`\>

## Constructors

### Constructor

> **new MatrixParamCondition**(...`params`): `MatrixParamCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:318

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

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:324

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

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:303

Matrix-parameter expressions that must all match.

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:153

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### content

#### Get Signature

> **get** **content**(): [`MatrixParamExpression`](MatrixParamExpression.md)[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:305

##### Returns

[`MatrixParamExpression`](MatrixParamExpression.md)[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:309

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

## Methods

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:166

Compare this condition to another value.

#### Parameters

##### value

`any`

The value to compare.

#### Returns

`boolean`

`true` when both conditions are equivalent.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-dispatcher/src/route-condition.ts:181

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:190

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)

***

### merge()

> **merge**(`value`): `MatrixParamCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:344

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

### getMatchingCondition()

> **getMatchingCondition**(`route`): `MatrixParamCondition` \| `null`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:358

Return this condition when every expression matches the route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`MatrixParamCondition` \| `null`

This condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:374

Compare matrix-parameter conditions by specificity.

#### Parameters

##### value

`MatrixParamCondition`

The condition to compare.

##### route?

`Route`\<`Record`\<`string`, `string`\>\>

Unused, part of the shared contract.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
