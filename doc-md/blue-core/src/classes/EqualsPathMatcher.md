[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / EqualsPathMatcher

# Class: EqualsPathMatcher

Defined in: packages/blue-core/src/path-matcher.ts:146

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

Defined in: packages/blue-core/src/path-matcher.ts:147

#### Parameters

##### pattern1

`string`

##### pattern2

`string`

#### Returns

`string`

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`merge`](../interfaces/PathMatcher.md#merge)

***

### getPatternComparator()

> **getPatternComparator**(`path`): [`Comparator`](../interfaces/Comparator.md)\<`string`\>

Defined in: packages/blue-core/src/path-matcher.ts:182

#### Parameters

##### path

`string`

#### Returns

[`Comparator`](../interfaces/Comparator.md)\<`string`\>

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`getPatternComparator`](../interfaces/PathMatcher.md#getpatterncomparator)

***

### match()

> **match**(`pattern`, `path`): `boolean`

Defined in: packages/blue-core/src/path-matcher.ts:186

#### Parameters

##### pattern

`string`

##### path

`string`

#### Returns

`boolean`

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`match`](../interfaces/PathMatcher.md#match)
