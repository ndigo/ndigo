[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / severityToLevel

# Function: severityToLevel()

> **severityToLevel**(`severityNumber`, `severityText?`): [`Level`](../classes/Level.md)

Defined in: packages/blue-logger/src/otel/level-mapping.ts:109

Convert OpenTelemetry SeverityNumber to a blue-logger Level

## Parameters

### severityNumber

`SeverityNumber`

The OTel severity number

### severityText?

`string`

Optional severity text for more precise mapping

## Returns

[`Level`](../classes/Level.md)

Corresponding Level (defaults to Apache level scheme)

## Example

```typescript
const level = severityToLevel(SeverityNumber.ERROR, 'error');
// ApacheLevel.ERROR
```
