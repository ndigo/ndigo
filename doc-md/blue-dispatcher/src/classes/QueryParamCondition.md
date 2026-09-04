[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / QueryParamCondition

# Class: QueryParamCondition

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:116

A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in RouteMapping\|RouteMapping.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`QueryParamCondition`\>

## Constructors

### Constructor

> **new QueryParamCondition**(...`params`): `QueryParamCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:135

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

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:141

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

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:120

Parameter expressions that must all match.

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

> **get** **content**(): [`QueryParamExpression`](QueryParamExpression.md)[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:122

##### Returns

[`QueryParamExpression`](QueryParamExpression.md)[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:126

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

> **merge**(`value`): `QueryParamCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:164

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

### getMatchingCondition()

> **getMatchingCondition**(`route`): `QueryParamCondition` \| `null`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:183

Return this condition when every expression matches the route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`QueryParamCondition` \| `null`

This condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:199

Compare parameter conditions by specificity.

#### Parameters

##### value

`QueryParamCondition`

The condition to compare.

##### route?

`Route`\<`Record`\<`string`, `string`\>\>

Unused, but part of the shared contract.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
