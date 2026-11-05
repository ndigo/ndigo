[**@ndigo/telemetry v0.0.1**](../../README.md)

***

[@ndigo/telemetry](../../README.md) / [index](../README.md) / severityNumberToLevel

# Function: severityNumberToLevel()

> **severityNumberToLevel**(`severityNumber`, `scheme?`): `string`

Converts an OpenTelemetry `SeverityNumber` to its corresponding string-based log level name.

## Parameters

### severityNumber

`SeverityNumber`

The `SeverityNumber` to convert.

### scheme?

[`SeverityScheme`](../type-aliases/SeverityScheme.md)

Optional. The `SeverityScheme` to use for conversion. Defaults to `'apache'`.

## Returns

`string`

The string name of the log level.
