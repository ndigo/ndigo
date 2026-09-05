[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / logRecordToEntry

# Function: logRecordToEntry()

> **logRecordToEntry**(`record`): [`Entry`](../type-aliases/Entry.md)

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:183

Convert an OpenTelemetry ReadableLogRecord back to a blue-logger Entry

This is primarily used for Layout compatibility - exporters that need to use
blue-logger's Layout system can convert LogRecords back to Entries for formatting.

## Parameters

### record

`ReadableLogRecord`

The ReadableLogRecord to convert

## Returns

[`Entry`](../type-aliases/Entry.md)

A blue-logger Entry

## Example

```typescript
const entry = logRecordToEntry(record);
const formatted = layout.format(entry);
```
