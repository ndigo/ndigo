[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / levelToSeverityText

# Function: levelToSeverityText()

> **levelToSeverityText**(`levelName`, `scheme?`): `string`

Defined in: [packages/blue-telemetry/src/severity/severity.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/severity/severity.ts#lines-85)

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
