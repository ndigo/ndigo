[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [path-matcher](../README.md) / URLGlobPathMatcher

# Class: URLGlobPathMatcher

`PathMatcher` for URL globs: translates a pattern (`*`, `**`, `?`, character
classes) into a regular expression, caches compiled patterns in a bounded
LRU keyed by pattern string, and compares patterns by specificity.

## Example

```ts
const matcher = new URLGlobPathMatcher();
matcher.match('/users/*', '/users/42'); // true
```

## Implements

- [`PathMatcher`](../interfaces/PathMatcher.md)

## Constructors

### Constructor

> **new URLGlobPathMatcher**(`cacheCapacity?`): `URLGlobPathMatcher`

#### Parameters

##### cacheCapacity?

`number` = `256`

Maximum number of compiled patterns to cache. Default: 256.

#### Returns

`URLGlobPathMatcher`

## Methods

### getPatternComparator()

> **getPatternComparator**(`path`): [`Comparator`](../../comparable/interfaces/Comparator.md)\<`string`\>

Given a full path, returns a [Comparator](../../comparable/interfaces/Comparator.md) suitable for sorting patterns
in order of explicitness for that path.

The approach used depends on the underlying implementation.

#### Parameters

##### path

`string`

The full path to use for comparison.

#### Returns

[`Comparator`](../../comparable/interfaces/Comparator.md)\<`string`\>

A comparator capable of sorting patterns in order of explicitness.

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`getPatternComparator`](../interfaces/PathMatcher.md#getpatterncomparator)

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

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`match`](../interfaces/PathMatcher.md#match)

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

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`merge`](../interfaces/PathMatcher.md#merge)
