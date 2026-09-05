[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / GlobPathMatcher

# Class: GlobPathMatcher

Defined in: packages/blue-core/src/path-matcher.ts:194

## Implements

- [`PathMatcher`](../interfaces/PathMatcher.md)

## Constructors

### Constructor

> **new GlobPathMatcher**(): `GlobPathMatcher`

#### Returns

`GlobPathMatcher`

## Methods

### getPatternComparator()

> **getPatternComparator**(`path`): [`Comparator`](../interfaces/Comparator.md)\<`string`\>

Defined in: packages/blue-core/src/path-matcher.ts:195

#### Parameters

##### path

`string`

#### Returns

[`Comparator`](../interfaces/Comparator.md)\<`string`\>

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`getPatternComparator`](../interfaces/PathMatcher.md#getpatterncomparator)

---

### match()

> **match**(`pattern`, `path`): `boolean`

Defined in: packages/blue-core/src/path-matcher.ts:199

#### Parameters

##### pattern

`string`

##### path

`string`

#### Returns

`boolean`

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`match`](../interfaces/PathMatcher.md#match)

---

### merge()

> **merge**(`pattern1`, `pattern2`): `string`

Defined in: packages/blue-core/src/path-matcher.ts:209

#### Parameters

##### pattern1

`string`

##### pattern2

`string`

#### Returns

`string`

#### Implementation of

[`PathMatcher`](../interfaces/PathMatcher.md).[`merge`](../interfaces/PathMatcher.md#merge)
