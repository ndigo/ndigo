[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / PatternMatcher

# Interface: PatternMatcher\<TPattern, TValue\>

Defined in: packages/blue-core/src/matchable.ts:23

Represents an object that can match a pattern against a value.

## Extended by

- [`PathMatcher`](PathMatcher.md)

## Type Parameters

### TPattern

`TPattern`

The type of the pattern to match.

### TValue

`TValue`

The type of the value to match against.

## Methods

### match()

> **match**(`pattern`, `value`): `boolean`

Defined in: packages/blue-core/src/matchable.ts:30

Matches a given pattern against a value.

#### Parameters

##### pattern

`TPattern`

The pattern to match.

##### value

`TValue`

The value to match against.

#### Returns

`boolean`

`true` if the pattern matches the value, `false` otherwise.
