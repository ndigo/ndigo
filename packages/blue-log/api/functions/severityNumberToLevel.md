[**@blue/log v0.0.1**](../README.md)

***

[@blue/log](../README.md) / severityNumberToLevel

# Function: severityNumberToLevel()

> **severityNumberToLevel**(`severityNumber`, `scheme?`): `string`

Converts an OpenTelemetry `SeverityNumber` to its corresponding string-based log level name.

## Parameters

### severityNumber

`SeverityNumber`

The `SeverityNumber` to convert.

### scheme?

[`SeverityScheme`](../type-aliases/SeverityScheme.md) = `'apache'`

Optional. The `SeverityScheme` to use for conversion. Defaults to `'apache'`.

## Returns

`string`

The string name of the log level.
