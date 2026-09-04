[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / CompositeRouteCondition

# Class: CompositeRouteCondition

Defined in: packages/blue-dispatcher/src/route-condition.ts:307

Implements the [RouteCondition](../interfaces/RouteCondition.md) contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.

When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`CompositeRouteCondition`\>

## Constructors

### Constructor

> **new CompositeRouteCondition**(...`routeConditions`): `CompositeRouteCondition`

Defined in: packages/blue-dispatcher/src/route-condition.ts:335

Create a composite condition from one or more route conditions.

#### Parameters

##### routeConditions

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[] \| [`RouteConditionHolder`](RouteConditionHolder.md)[]

Conditions to combine.

#### Returns

`CompositeRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### routeConditions

> `readonly` **routeConditions**: [`RouteConditionHolder`](RouteConditionHolder.md)[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:328

## Accessors

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:308

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:312

Whether this condition contains no content.

##### Returns

`boolean`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:316

##### Returns

`number`

***

### conditions

#### Get Signature

> **get** **conditions**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:320

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

***

### content

#### Get Signature

> **get** **content**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:324

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

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

> **merge**(`other`): `CompositeRouteCondition`

Defined in: packages/blue-dispatcher/src/route-condition.ts:367

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

### getMatchingCondition()

> **getMatchingCondition**(`route`): `CompositeRouteCondition` \| `null`

Defined in: packages/blue-dispatcher/src/route-condition.ts:390

Return the subset of conditions that match the route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`CompositeRouteCondition` \| `null`

A matching composite condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:412

Compare two composite conditions in route-specific context.

#### Parameters

##### value

`CompositeRouteCondition`

The condition to compare.

##### route?

`Route`\<`Record`\<`string`, `string`\>\>

The route used to break ties, if needed.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
