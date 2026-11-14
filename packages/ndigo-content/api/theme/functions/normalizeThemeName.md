[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [theme](../README.md) / normalizeThemeName

# Function: normalizeThemeName()

> **normalizeThemeName**(`value`): `string` \| `null`

Validates a theme name from an untrusted source (cookie, header, query).

Values are rejected, never escaped and passed on: a name that fails the
shape test falls back to the configured default instead of reaching markup
or CSS.

## Parameters

### value

`unknown`

The candidate theme name.

## Returns

`string` \| `null`

The name when it matches the accepted shape, or `null`.
