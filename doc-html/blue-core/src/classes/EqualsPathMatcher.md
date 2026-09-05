[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / EqualsPathMatcher

# Class: EqualsPathMatcher

Defined in: [packages/blue-core/src/path-matcher.ts:170](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-170)

## Implements

- [`PathMatcher`](../interfaces/PathMatcher.md)

## Constructors

### Constructor

> **new EqualsPathMatcher**(): `EqualsPathMatcher`

#### Returns

`EqualsPathMatcher`

## Methods

### merge()

> **merge**(`pattern1`, `pattern2`): `string`

Defined in: [packages/blue-core/src/path-matcher.ts:171](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-171)

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

***

### getPatternComparator()

> **getPatternComparator**(`path`): [`Comparator`](../interfaces/Comparator.md)\<`string`\>

Defined in: [packages/blue-core/src/path-matcher.ts:217](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-217)

Given a full path, returns a [Comparator](../interfaces/Comparator.md) suitable for sorting patterns
in order of explicitness for that path.

The approach used depends on the underlying implementation.

#### Parameters

##### path

`string`

The full path to use for comparison.

#### Returns

[`Comparator`](../interfaces/Comparator.md)\<`string`\>

A comparator capable of sorting patterns in order of explicitness.

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`getPatternComparator`](../interfaces/PathMatcher.md#getpatterncomparator)

***

### match()

> **match**(`pattern`, `path`): `boolean`

Defined in: [packages/blue-core/src/path-matcher.ts:221](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-221)

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
