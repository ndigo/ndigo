[**@ndigo/log v0.0.1**](../README.md)

***

[@ndigo/log](../README.md) / levelToSeverityNumber

# Function: levelToSeverityNumber()

> **levelToSeverityNumber**(`levelName`, `scheme?`): `SeverityNumber`

Converts a string-based log level name to its corresponding OpenTelemetry `SeverityNumber`.
If a scheme is not provided, it attempts to detect the scheme automatically.

An unknown level name falls back to the resolved scheme's default level
(`SeverityNumber.INFO` for every built-in scheme) rather than throwing —
pass the level in the scheme's own vocabulary (or an explicit `scheme`)
to avoid an unintended INFO downgrade of a severe record.

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
