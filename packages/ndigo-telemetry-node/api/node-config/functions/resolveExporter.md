[**@ndigo/telemetry-node v0.0.1**](../../README.md)

***

[@ndigo/telemetry-node](../../README.md) / [node-config](../README.md) / resolveExporter

# Function: resolveExporter()

> **resolveExporter**(`spec`, `signal`): [`ResolvedExporter`](../type-aliases/ResolvedExporter.md)

Resolves a per-signal exporter spec (AD-32 D-2/D-3). Pure — no providers
are touched — so the shape table is unit-testable in one process.
OTLP urls fail loud here (`new URL`), naming the signal in the error.

## Parameters

### spec

[`ExporterSpec`](../type-aliases/ExporterSpec.md) \| `undefined`

The exporter spec to resolve.

### signal

`"trace"` \| `"metric"` \| `"log"`

The signal being configured.

## Returns

[`ResolvedExporter`](../type-aliases/ResolvedExporter.md)

The normalized export choice.

## Throws

When `'prometheus'` is used for a non-metric signal or an OTLP url is invalid.

## Example

```ts
resolveExporter({ url: 'http://localhost:4318/v1/traces' }, 'trace');
// { kind: 'otlp', url: 'http://localhost:4318/v1/traces' }
```
