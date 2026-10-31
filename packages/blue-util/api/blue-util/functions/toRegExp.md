[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-2.md) / toRegExp

# Function: toRegExp()

> **toRegExp**(`value`): `RegExp`

Returns a regular expression for the given `pattern`.
Input of the `/pattern/flags` form is split into a source and flags, where the
flags may contain only `g`, `i`, `m`, `s`, `u` or `y`, without duplicates. Any
other input - including plain patterns that merely contain flag letters
(`greedy`) and malformed slash forms (`/foo/garbage`, `/foo/gg`) - is compiled
as a literal pattern, slashes included, so it never fails on its flags.

## Parameters

### value

`string`

The pattern string (with optional /pattern/flags format)

## Returns

`RegExp`

## Throws

If the pattern is not valid regular expression syntax
`security` WARNING: This function accepts arbitrary regex patterns.
  Do not use with untrusted user input without validation.
  Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS.
