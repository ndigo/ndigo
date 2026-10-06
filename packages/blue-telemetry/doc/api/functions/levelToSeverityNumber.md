[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / levelToSeverityNumber

# Function: levelToSeverityNumber()

> **levelToSeverityNumber**(`levelName`, `scheme?`): `SeverityNumber`

Converts a string-based log level name to its corresponding OpenTelemetry `SeverityNumber`.
If a scheme is not provided, it attempts to detect the scheme automatically.

## Parameters

### levelName

`string`

The string name of the log level.

### scheme?

[`SeverityScheme`](../type-aliases/SeverityScheme.md)

Optional. The `SeverityScheme` to use for conversion.

## Returns

`SeverityNumber`

The `SeverityNumber` corresponding to the given level name.
