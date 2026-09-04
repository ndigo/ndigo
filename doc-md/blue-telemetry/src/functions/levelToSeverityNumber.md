[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / levelToSeverityNumber

# Function: levelToSeverityNumber()

> **levelToSeverityNumber**(`levelName`, `scheme?`): `SeverityNumber`

Defined in: packages/blue-telemetry/src/severity/severity.ts:62

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
