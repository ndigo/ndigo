[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [string](../README.md) / toRegExp

# Function: toRegExp()

> **toRegExp**(`value`): `RegExp`

Defined in: packages/blue-util/src/string/to-reg-exp.ts:32

Returns a regular expression for the given `pattern`.

## Parameters

### value

`string`

The pattern string (with optional /pattern/flags format)

## Returns

`RegExp`

## Throws

If the pattern is malformed

## Security

WARNING: This function accepts arbitrary regex patterns. 
  Do not use with untrusted user input without validation.
  Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS.
