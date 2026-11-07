[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [path-matcher](../README.md) / GlobPatternInfo

# Class: GlobPatternInfo

Wildcard-pattern analysis used by `GlobPatternComparator`: counts `*` and
`**` occurrences and answers the specificity questions ordering depends on
(`isLeastSpecific`, `isPrefixPattern`).

## Constructors

### Constructor

> **new GlobPatternInfo**(`pattern?`): `GlobPatternInfo`

#### Parameters

##### pattern?

`string` \| `null` = `null`

#### Returns

`GlobPatternInfo`

## Properties

### doubleWildcards

> **doubleWildcards**: `number`

Number of `**` double-wildcard occurrences.

***

### pattern

> `readonly` **pattern**: `string`

The glob pattern being analyzed.

***

### singleWildcards

> **singleWildcards**: `number`

Number of single `*` wildcard occurrences.

## Accessors

### isLeastSpecific

#### Get Signature

> **get** **isLeastSpecific**(): `boolean`

Whether the pattern is the catch-all `/**`.

##### Returns

`boolean`

***

### isPrefixPattern

#### Get Signature

> **get** **isPrefixPattern**(): `boolean`

Whether the pattern ends with a trailing `/**`.

##### Returns

`boolean`

***

### length

#### Get Signature

> **get** **length**(): `number`

Length of the pattern string.

##### Returns

`number`

***

### totalCount

#### Get Signature

> **get** **totalCount**(): `number`

Weighted wildcard count used for specificity ordering.

##### Returns

`number`
