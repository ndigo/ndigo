[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / normalizeLocale

# Function: normalizeLocale()

> **normalizeLocale**(`value`): `string` \| `undefined`

Validates and canonicalizes a language tag.

Rejects non-strings, empty/overlong values, tags with characters outside
the BCP 47 alphabet (quotes, whitespace, angle brackets), and tags the
platform's `Intl` implementation refuses. Returns the canonical form
(`EN-us` → `en-US`) or `undefined` when the value is not a usable tag.

## Parameters

### value

`unknown`

The candidate language tag.

## Returns

`string` \| `undefined`

The canonical tag, or `undefined` when unusable.
