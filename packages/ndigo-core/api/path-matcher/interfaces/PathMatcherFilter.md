[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [path-matcher](../README.md) / PathMatcherFilter

# Interface: PathMatcherFilter

Defines a contract for filtering paths based on include and exclude patterns.
This interface is typically implemented by mixins or classes that need path filtering capabilities.

## Extends

- [`Matchable`](../../matchable/interfaces/Matchable.md)\<`string`\>

## Properties

### pathMatcher

> **pathMatcher**: [`PathMatcher`](PathMatcher.md)

The `PathMatcher` instance used for matching patterns.

## Methods

### matches()

> **matches**(`path`, `matcher?`): `boolean`

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

#### Overrides

[`Matchable`](../../matchable/interfaces/Matchable.md).[`matches`](../../matchable/interfaces/Matchable.md#matches)

***

### setExcludePatterns()

> **setExcludePatterns**(`excludePatterns`): `void`

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

Sets the patterns to include. Paths must match at least one of these patterns to be included.
If no include patterns are set, all paths are considered included (unless excluded by `excludePatterns`).

#### Parameters

##### includePatterns

`string`[]

An array of patterns to include.

#### Returns

`void`
