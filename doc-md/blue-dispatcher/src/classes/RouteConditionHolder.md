[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteConditionHolder

# Class: RouteConditionHolder

Defined in: packages/blue-dispatcher/src/route-condition.ts:237

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`RouteConditionHolder`\>

## Constructors

### Constructor

> **new RouteConditionHolder**(`routeCondition?`): `RouteConditionHolder`

Defined in: packages/blue-dispatcher/src/route-condition.ts:256

Create a holder for an optional condition.

#### Parameters

##### routeCondition?

[`RouteCondition`](../interfaces/RouteCondition.md) = `null`

The wrapped condition, if any.

#### Returns

`RouteConditionHolder`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### condition

> `readonly` **condition**: [`RouteCondition`](../interfaces/RouteCondition.md)

Defined in: packages/blue-dispatcher/src/route-condition.ts:241

Wrapped condition, when present.

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:168

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### content

#### Get Signature

> **get** **content**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:243

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:247

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

## Methods

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:181

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

Defined in: packages/blue-dispatcher/src/route-condition.ts:196

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:205

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)

***

### merge()

> **merge**(`other`): `RouteConditionHolder`

Defined in: packages/blue-dispatcher/src/route-condition.ts:277

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

### getMatchingCondition()

> **getMatchingCondition**(`route`): `RouteConditionHolder`

Defined in: packages/blue-dispatcher/src/route-condition.ts:296

Return a holder for the wrapped condition when it matches the route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`RouteConditionHolder`

A matching holder, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:311

Compare two holders by comparing their wrapped conditions.

#### Parameters

##### value

`RouteConditionHolder`

The holder to compare.

##### route?

`Route`

The route used to break ties, if needed.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
