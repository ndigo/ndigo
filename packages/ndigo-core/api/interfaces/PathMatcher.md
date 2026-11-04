[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / PathMatcher

# Interface: PathMatcher

Defines a contract for matching and merging path patterns.
This interface extends `PatternMatcher` for string patterns and paths.

## Extends

- [`PatternMatcher`](PatternMatcher.md)\<`string`, `string`\>

## Methods

### getPatternComparator()

> **getPatternComparator**(`path`): [`Comparator`](Comparator.md)\<`string`\>

Given a full path, returns a [Comparator](Comparator.md) suitable for sorting patterns
in order of explicitness for that path.

The approach used depends on the underlying implementation.

#### Parameters

##### path

`string`

The full path to use for comparison.

#### Returns

[`Comparator`](Comparator.md)\<`string`\>

A comparator capable of sorting patterns in order of explicitness.

***

### match()

> **match**(`pattern`, `path`): `boolean`

Match the given `path` against the given `pattern`, according to this PathMatcher's matching strategy.

#### Parameters

##### pattern

`string`

The pattern to match against.

##### path

`string`

The path to test.

#### Returns

`boolean`

Whether or not the `path` matched.

#### Overrides

[`PatternMatcher`](PatternMatcher.md).[`match`](PatternMatcher.md#match)

***

### merge()

> **merge**(`pattern1`, `pattern2`): `string`

Combines two patterns into a new pattern.

The approach used for combining the two patterns depends on the underlying implementation.

#### Parameters

##### pattern1

`string`

The first pattern.

##### pattern2

`string`

The second pattern.

#### Returns

`string`

The combination of the two patterns.
