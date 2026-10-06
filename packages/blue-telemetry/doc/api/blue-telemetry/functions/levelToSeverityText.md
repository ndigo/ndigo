[**@blue/telemetry v0.0.1**](../../README.md)

***

[@blue/telemetry](../../README.md) / [blue-telemetry](../README.md) / levelToSeverityText

# Function: levelToSeverityText()

> **levelToSeverityText**(`levelName`, `scheme?`): `string`

Converts a string-based log level name to its corresponding severity text,
first converting to `SeverityNumber` and then back to text.
If a scheme is not provided, it attempts to detect the scheme automatically.

## Parameters

### levelName

`string`

The string name of the log level.

### scheme?

[`SeverityScheme`](../type-aliases/SeverityScheme.md)

Optional. The `SeverityScheme` to use for conversion.

## Returns

`string`

The string representation of the severity.
