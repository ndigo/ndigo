[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / likePathMatcher

# Variable: likePathMatcher

> `const` **likePathMatcher**: (`value`) => `value is PathMatcher`

Type guard that checks if a given value is a [PathMatcher](../interfaces/PathMatcher.md).
A value is considered a `PathMatcher` if it has `getPatternComparator`, `match`, and `merge` methods.

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is PathMatcher`

`true` if the value is a `PathMatcher`, `false` otherwise.
