[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractRouteCondition

# Abstract Class: AbstractRouteCondition\<T\>

Defined in: packages/blue-dispatcher/src/route-condition.ts:130

## Extended by

- [`RouteConditionHolder`](RouteConditionHolder.md)
- [`CompositeRouteCondition`](CompositeRouteCondition.md)
- [`ParamsRouteCondition`](ParamsRouteCondition.md)
- [`PatternsRouteCondition`](PatternsRouteCondition.md)

## Type Parameters

### T

`T` *extends* `AbstractRouteCondition`\<`T`\>

## Implements

- [`Equatable`](../../../blue-core/src/interfaces/Equatable.md)
- [`RouteCondition`](../interfaces/RouteCondition.md)\<`T`\>
- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Constructors

### Constructor

> **new AbstractRouteCondition**\<`T`\>(): `AbstractRouteCondition`\<`T`\>

#### Returns

`AbstractRouteCondition`\<`T`\>

## Properties

### content

> `abstract` **content**: `any`[]

Defined in: packages/blue-dispatcher/src/route-condition.ts:137

***

### infix

> `abstract` **infix**: `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:138

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:133

##### Returns

`boolean`

## Methods

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:140

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Implementation of

[`Equatable`](../../../blue-core/src/interfaces/Equatable.md).[`equals`](../../../blue-core/src/interfaces/Equatable.md#equals)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-dispatcher/src/route-condition.ts:150

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:154

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)

***

### merge()

> `abstract` **merge**(`other`): `T`

Defined in: packages/blue-dispatcher/src/route-condition.ts:158

#### Parameters

##### other

`T`

#### Returns

`T`

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`merge`](../interfaces/RouteCondition.md#merge)

***

### getMatchingCondition()

> `abstract` **getMatchingCondition**(`route`): `T`

Defined in: packages/blue-dispatcher/src/route-condition.ts:160

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`T`

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`getMatchingCondition`](../interfaces/RouteCondition.md#getmatchingcondition)

***

### compareTo()

> `abstract` **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:162

#### Parameters

##### value

`T`

##### route?

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`number`

#### Implementation of

[`RouteCondition`](../interfaces/RouteCondition.md).[`compareTo`](../interfaces/RouteCondition.md#compareto)
