[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ParamsRouteCondition

# Class: ParamsRouteCondition

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:87

A logical conjunction (' && ') route condition that matches a route against a set parameter expressions with syntax defined in RouteMapping\|RouteMapping.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`ParamsRouteCondition`\>

## Constructors

### Constructor

> **new ParamsRouteCondition**(...`params`): `ParamsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:98

#### Parameters

##### params

...`string`[]

#### Returns

`ParamsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

### Constructor

> **new ParamsRouteCondition**(`conditions`): `ParamsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:99

#### Parameters

##### conditions

`Set`\<[`ParamExpression`](ParamExpression.md)\>

#### Returns

`ParamsRouteCondition`

#### Overrides

`AbstractRouteCondition<ParamsRouteCondition>.constructor`

## Properties

### expressions

> `readonly` **expressions**: `Set`\<[`ParamExpression`](ParamExpression.md)\>

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:88

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

> **get** **content**(): [`ParamExpression`](ParamExpression.md)[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:90

##### Returns

[`ParamExpression`](ParamExpression.md)[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:94

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

> **merge**(`value`): `ParamsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:116

Returns a new instance with the union of the param expressions from _this_ and the value provided.

#### Parameters

##### value

`ParamsRouteCondition`

#### Returns

`ParamsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `ParamsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:129

Returns `this` instance if the route matches all param expressions or `null` otherwise.

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`ParamsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:145

Compare to another condition based on parameter expressions. A condition is considered to be a more specific match, if it has:
- A greater number of expressions.
- A greater number of non-negated expressions with a concrete value.
    *

#### Parameters

##### value

`ParamsRouteCondition`

##### route?

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`number`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
