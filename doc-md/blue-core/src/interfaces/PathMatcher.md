[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / PathMatcher

# Interface: PathMatcher

Defined in: packages/blue-core/src/path-matcher.ts:11

## Extends

- [`PatternMatcher`](PatternMatcher.md)\<`string`, `string`\>

## Methods

### getPatternComparator()

> **getPatternComparator**(`path`): [`Comparator`](Comparator.md)\<`string`\>

Defined in: packages/blue-core/src/path-matcher.ts:12

#### Parameters

##### path

`string`

#### Returns

[`Comparator`](Comparator.md)\<`string`\>

***

### match()

> **match**(`pattern`, `path`): `boolean`

Defined in: packages/blue-core/src/path-matcher.ts:13

#### Parameters

##### pattern

`string`

##### path

`string`

#### Returns

`boolean`

#### Overrides

[`PatternMatcher`](PatternMatcher.md).[`match`](PatternMatcher.md#match)

***

### merge()

> **merge**(`pattern1`, `pattern2`): `string`

Defined in: packages/blue-core/src/path-matcher.ts:14

#### Parameters

##### pattern1

`string`

##### pattern2

`string`

#### Returns

`string`
