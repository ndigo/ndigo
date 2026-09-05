[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / severityNumberToLevel

# Function: severityNumberToLevel()

> **severityNumberToLevel**(`severityNumber`, `scheme?`): `string`

Defined in: [packages/blue-telemetry/src/severity/severity.ts:73](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/severity/severity.ts#lines-73)

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
