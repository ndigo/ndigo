[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / extractTraceContext

# Function: extractTraceContext()

> **extractTraceContext**(`entry`): `object`

Defined in: packages/blue-logger/src/otel/entry-to-logrecord.ts:251

Extract trace context from an Entry's attributes

## Parameters

### entry

[`Entry`](../type-aliases/Entry.md)

The Entry to extract trace context from

## Returns

`object`

Trace context object or undefined

### traceId?

> `optional` **traceId**: `string`

### spanId?

> `optional` **spanId**: `string`

### traceFlags?

> `optional` **traceFlags**: `number`
