[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / WildcardMatcher

# Class: WildcardMatcher

Defined in: [packages/blue-http/src/http.ts:358](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-358)

Pattern matcher that uses wildcard expressions and caches compiled patterns.

## Implements

- `PatternMatcher`\<`string`, `string`\>

## Constructors

### Constructor

> **new WildcardMatcher**(): `WildcardMatcher`

#### Returns

`WildcardMatcher`

## Methods

### match()

> **match**(`pattern`, `value`): `boolean`

Defined in: [packages/blue-http/src/http.ts:366](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-366)

Tests whether a value matches a wildcard pattern.

#### Parameters

##### pattern

`string`

The wildcard pattern to compile and cache.

##### value

`string`

The value to test.

#### Returns

`boolean`

`true` when the pattern matches the value.

#### Implementation of

`PatternMatcher.match`
