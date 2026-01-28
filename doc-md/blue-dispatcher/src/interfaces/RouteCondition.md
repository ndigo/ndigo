[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteCondition

# Interface: RouteCondition\<T\>

Defined in: packages/blue-dispatcher/src/route-condition.ts:11

## Type Parameters

### T

`T` = `any`

## Methods

### merge()

> **merge**(`value`): `T`

Defined in: packages/blue-dispatcher/src/route-condition.ts:12

#### Parameters

##### value

`T`

#### Returns

`T`

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `T`

Defined in: packages/blue-dispatcher/src/route-condition.ts:13

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`T`

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:14

#### Parameters

##### value

`T`

##### route?

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`number`
