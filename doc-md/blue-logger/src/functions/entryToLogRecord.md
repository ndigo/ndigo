[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / entryToLogRecord

# Function: entryToLogRecord()

> **entryToLogRecord**(`entry`, `options`): `Partial`\<`LogRecord`\>

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:77

Convert a blue-logger Entry to an OpenTelemetry LogRecord

## Parameters

### entry

[`Entry`](../type-aliases/Entry.md)

The Entry to convert

### options

[`EntryToLogRecordOptions`](../interfaces/EntryToLogRecordOptions.md) = `{}`

Conversion options

## Returns

`Partial`\<`LogRecord`\>

A LogRecord compatible with OTel exporters

## Example

```typescript
const entry = newEntry('app', ApacheLevel.ERROR, ['Something failed']);
const logRecord = entryToLogRecord(entry);
```
