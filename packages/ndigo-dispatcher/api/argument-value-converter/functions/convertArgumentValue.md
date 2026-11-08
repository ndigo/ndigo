[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [argument-value-converter](../README.md) / convertArgumentValue

# Function: convertArgumentValue()

> **convertArgumentValue**(`convertType`, `value`, `parameter`, `route`, `mapping`): `unknown`

Converts a resolved argument value and wraps conversion failures.

## Parameters

### convertType

\{ `source`: `unknown`; `target`: `unknown`; \} \| `undefined`

The source/target type pair.

### value

`unknown`

The resolved raw value.

### parameter

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)

The method parameter descriptor.

### route

[`Route`](#)

The route being resolved.

### mapping

`unknown`

The method's route mapping.

## Returns

`unknown`

The converted value.
