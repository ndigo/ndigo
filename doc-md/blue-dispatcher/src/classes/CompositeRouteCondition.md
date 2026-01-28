[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / CompositeRouteCondition

# Class: CompositeRouteCondition

Defined in: packages/blue-dispatcher/src/route-condition.ts:251

Implements the [RouteCondition](../interfaces/RouteCondition.md) contract by delegating to multiple `RouteCondition` types and using a logical conjunction (' && ') to ensure all conditions match a given route.

When `CompositeRouteCondition` instances are combined or compared they are expected to (a) contain the same number of conditions and (b) that conditions in the respective index are of the same type. It is acceptable to provide `null` conditions or no conditions at all to the constructor.

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`CompositeRouteCondition`\>

## Constructors

### Constructor

> **new CompositeRouteCondition**(...`routeConditions`): `CompositeRouteCondition`

Defined in: packages/blue-dispatcher/src/route-condition.ts:274

#### Parameters

##### routeConditions

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[] | [`RouteConditionHolder`](RouteConditionHolder.md)[]

#### Returns

`CompositeRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

## Properties

### routeConditions

> `readonly` **routeConditions**: [`RouteConditionHolder`](RouteConditionHolder.md)[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:272

## Accessors

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:252

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

***

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:256

##### Returns

`boolean`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### length

#### Get Signature

> **get** **length**(): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:260

##### Returns

`number`

***

### conditions

#### Get Signature

> **get** **conditions**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:264

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

***

### content

#### Get Signature

> **get** **content**(): [`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:268

##### Returns

[`RouteCondition`](../interfaces/RouteCondition.md)\<`any`\>[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

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

> **merge**(`other`): `CompositeRouteCondition`

Defined in: packages/blue-dispatcher/src/route-condition.ts:300

If one instance is empty, return the other. If both instances have conditions, combine the individual conditions after ensuring they are of the same type and number.
    *

#### Parameters

##### other

`CompositeRouteCondition`

#### Returns

`CompositeRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `CompositeRouteCondition`

Defined in: packages/blue-dispatcher/src/route-condition.ts:317

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`CompositeRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:332

#### Parameters

##### value

`CompositeRouteCondition`

##### route?

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`number`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
