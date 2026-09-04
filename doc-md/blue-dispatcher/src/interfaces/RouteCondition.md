[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteCondition

# Interface: RouteCondition\<T\>

Defined in: packages/blue-dispatcher/src/route-condition.ts:21

Contract for route matching conditions.

## Type Parameters

### T

`T` = `any`

## Methods

### merge()

> **merge**(`value`): `T`

Defined in: packages/blue-dispatcher/src/route-condition.ts:28

Merge this condition with another condition of the same type.

#### Parameters

##### value

`T`

The condition to merge with.

#### Returns

`T`

The merged condition.

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `T` \| `null`

Defined in: packages/blue-dispatcher/src/route-condition.ts:36

Return the condition that matches a route, or `null` when no match exists.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`T` \| `null`

A matching condition instance or `null`.

***

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Defined in: packages/blue-dispatcher/src/route-condition.ts:45

Compare this condition with another condition.

#### Parameters

##### value

`T`

The condition to compare against.

##### route?

`Route`\<`Record`\<`string`, `string`\>\>

The route used to break ties, if needed.

#### Returns

`number`

A comparison result compatible with `Array.prototype.sort`.
