[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / injectTraceContext

# Function: injectTraceContext()

> **injectTraceContext**(`logRecord`, `context?`): `void`

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:265

Inject trace context into a LogRecord from the current active span

## Parameters

### logRecord

`Partial`\<`LogRecord`\>

The LogRecord to inject trace context into

### context?

`Context`

Optional context to use (defaults to active context)

## Returns

`void`
