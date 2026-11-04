[**@ndigo/telemetry v0.0.1**](../README.md)

***

[@ndigo/telemetry](../README.md) / currentTraceContext

# Function: currentTraceContext()

> **currentTraceContext**(): [`TraceCorrelation`](../interfaces/TraceCorrelation.md) \| `undefined`

Returns the active span's trace ids, or `undefined` when no span is
active (no provider, or outside any span) — safe in pure-logging mode.

## Returns

[`TraceCorrelation`](../interfaces/TraceCorrelation.md) \| `undefined`

## Example

**Stamping an outbound queue message with the current trace:**

```ts
const correlation = currentTraceContext();
await queue.push({ ...payload, traceparent: correlation ? `${correlation.traceId}/${correlation.spanId}` : undefined });
```
