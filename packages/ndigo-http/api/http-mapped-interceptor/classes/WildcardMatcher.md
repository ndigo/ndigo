[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-mapped-interceptor](../README.md) / WildcardMatcher

# Class: WildcardMatcher

`PatternMatcher` over wildcard patterns: compiles each pattern once into a
`WildcardExp` (cached) and tests values against it — the mapping behind
URL-mapped interceptors.

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
