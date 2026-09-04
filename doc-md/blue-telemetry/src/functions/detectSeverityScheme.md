[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / detectSeverityScheme

# Function: detectSeverityScheme()

> **detectSeverityScheme**(`levelName`): [`SeverityScheme`](../type-aliases/SeverityScheme.md)

Defined in: packages/blue-telemetry/src/severity/severity.ts:33

Attempts to detect the `SeverityScheme` based on a given log level name.
This function uses a heuristic to guess the most likely scheme.

## Parameters

### levelName

`string`

The string name of the log level.

## Returns

[`SeverityScheme`](../type-aliases/SeverityScheme.md)

The detected `SeverityScheme`. Defaults to `'apache'` if no specific scheme is detected.
