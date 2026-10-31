[**@blue/scheduler v0.0.1**](../README.md)

***

[@blue/scheduler](../README.md) / parseDuration

# Function: parseDuration()

> **parseDuration**(`value`, `label?`, `options?`): `number`

Parses a [DurationValue](../type-aliases/DurationValue.md) into milliseconds.

## Parameters

### value

[`DurationValue`](../type-aliases/DurationValue.md)

Milliseconds (number) or a compact unit string.

### label?

`string` = `'duration'`

Field name used in error messages.

### options?

When `positive` is set, zero is rejected (used for
  intervals, where a zero period can never fire).

#### positive?

`boolean`

## Returns

`number`

The duration in milliseconds.

## Throws

When the value is not a finite non-negative number of
  milliseconds or a `'10s'`-style string.
