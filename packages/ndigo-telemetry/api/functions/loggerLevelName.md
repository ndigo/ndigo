[**@ndigo/telemetry v0.0.1**](../README.md)

***

[@ndigo/telemetry](../README.md) / loggerLevelName

# Function: loggerLevelName()

> **loggerLevelName**(`severityNumber`): `string`

Renders a threshold severity back to its canonical level name.

Exact `LOGGER_THRESHOLDS` hits round-trip (`silent`-style scheme names are
not threshold names); anything else falls back to the apache scheme's
text so the wire never carries a bare number.

## Parameters

### severityNumber

`SeverityNumber`

The threshold severity.

## Returns

`string`

The level name.
