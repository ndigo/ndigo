[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / RouteCondition

# Interface: RouteCondition\<T\>

Contract for route matching conditions.

## Extends

- `ResultMatcher`\<[`Route`](#), `T`\>

## Type Parameters

### T

`T` = `unknown`

## Methods

### compareTo()

> **compareTo**(`value`, `route?`): `number`

Compare this condition with another condition.

#### Parameters

##### value

`T`

The condition to compare against.

##### route?

[`Route`](#)\<`Record`\<`string`, `string`\>\>

The route used to break ties, if needed.

#### Returns

`number`

A comparison result compatible with `Array.prototype.sort`.

***

### match()

> **match**(`route`): `T` \| `null`

Return the condition that matches a route, or `null` when no match exists.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`T` \| `null`

A matching condition instance or `null`.

#### Overrides

`ResultMatcher.match`

***

### merge()

> **merge**(`value`): `T`

Merge this condition with another condition of the same type.

#### Parameters

##### value

`T`

The condition to merge with.

#### Returns

`T`

The merged condition.
