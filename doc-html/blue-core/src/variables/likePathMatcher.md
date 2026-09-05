[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / likePathMatcher

# Variable: likePathMatcher

> `const` **likePathMatcher**: (`value`) => `value is PathMatcher`

Defined in: [packages/blue-core/src/path-matcher.ts:88](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-88)

Type guard that checks if a given value is a [PathMatcher](../interfaces/PathMatcher.md).
A value is considered a `PathMatcher` if it has `getPatternComparator`, `match`, and `merge` methods.

## Parameters

### value

`any`

The value to check.

## Returns

`value is PathMatcher`

`true` if the value is a `PathMatcher`, `false` otherwise.
