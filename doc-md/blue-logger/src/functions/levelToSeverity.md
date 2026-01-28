[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / levelToSeverity

# Function: levelToSeverity()

> **levelToSeverity**(`level`, `scheme`): [`SeverityMapping`](../interfaces/SeverityMapping.md)

Defined in: packages/blue-logger/src/otel/level-mapping.ts:69

Convert a blue-logger Level to OpenTelemetry SeverityNumber and SeverityText

## Parameters

### level

[`Level`](../classes/Level.md)

The Level to convert

### scheme

Optional level scheme ('apache', 'npm', 'cli', 'syslog'). Defaults to 'apache'.

`"apache"` | `"npm"` | `"cli"` | `"syslog"`

## Returns

[`SeverityMapping`](../interfaces/SeverityMapping.md)

Severity mapping with severityNumber and severityText

## Example

```typescript
const severity = levelToSeverity(ApacheLevel.ERROR);
// { severityNumber: SeverityNumber.ERROR, severityText: 'error' }
```
