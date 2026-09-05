[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / PathMatcherFilter

# Interface: PathMatcherFilter

Defined in: [packages/blue-core/src/path-matcher.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-57)

Defines a contract for filtering paths based on include and exclude patterns.
This interface is typically implemented by mixins or classes that need path filtering capabilities.

## Properties

### pathMatcher

> **pathMatcher**: [`PathMatcher`](PathMatcher.md)

Defined in: [packages/blue-core/src/path-matcher.ts:61](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-61)

The `PathMatcher` instance used for matching patterns.

## Methods

### matches()

> **matches**(`path`, `matcher?`): `boolean`

Defined in: [packages/blue-core/src/path-matcher.ts:68](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-68)

Checks if a given path matches the configured include/exclude patterns.

#### Parameters

##### path

`string`

The path to check.

##### matcher?

[`PathMatcher`](PathMatcher.md)

An optional `PathMatcher` to use for matching. If not provided, `this.pathMatcher` is used.

#### Returns

`boolean`

`true` if the path matches the include patterns and does not match any exclude patterns, `false` otherwise.

***

### setExcludePatterns()

> **setExcludePatterns**(`excludePatterns`): `void`

Defined in: [packages/blue-core/src/path-matcher.ts:73](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-73)

Sets the patterns to exclude. Paths matching these patterns will be filtered out.

#### Parameters

##### excludePatterns

`string`[]

An array of patterns to exclude.

#### Returns

`void`

***

### setIncludePatterns()

> **setIncludePatterns**(`includePatterns`): `void`

Defined in: [packages/blue-core/src/path-matcher.ts:79](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/path-matcher.ts#lines-79)

Sets the patterns to include. Paths must match at least one of these patterns to be included.
If no include patterns are set, all paths are considered included (unless excluded by `excludePatterns`).

#### Parameters

##### includePatterns

`string`[]

An array of patterns to include.

#### Returns

`void`
