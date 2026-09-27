[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-2.md) / toRegExp

# Function: toRegExp()

> **toRegExp**(`value`): `RegExp`

Returns a regular expression for the given `pattern`.

## Parameters

### value

`string`

The pattern string (with optional /pattern/flags format)

## Returns

`RegExp`

## Throws

If the pattern is malformed
`security` WARNING: This function accepts arbitrary regex patterns.
  Do not use with untrusted user input without validation.
  Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS.
