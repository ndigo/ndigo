[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [shared](../README.md) / satisfiesVersion

# Function: satisfiesVersion()

> **satisfiesVersion**(`version`, `range`): `boolean`

Checks whether the given version satisfies a semver range.

Uses the standard `semver` library (`semver.satisfies`). When either the
version or the range is not a valid semver expression, returns `false`.

## Parameters

### version

`string`

The actual version string, e.g. `'1.2.0'`.

### range

`string`

The range to satisfy, e.g. `'^1.0.0'`.

## Returns

`boolean`

`true` when the version satisfies the range.

## Example

```ts
satisfiesVersion('1.2.0', '^1.0.0'); // true
satisfiesVersion('2.0.0', '^1.0.0'); // false
```
