[**@ndigo/telemetry-node v0.0.1**](../../README.md)

***

[@ndigo/telemetry-node](../../README.md) / [node-config](../README.md) / TelemetryConfig

# Interface: TelemetryConfig

Node telemetry configuration: the exporter chosen per signal (traces,
metrics, logs), an optional sampler and instrumentation list, and the minimum
severity applied to the log pipeline.

## Properties

### instrumentations?

> `optional` **instrumentations?**: `Instrumentation`\<`InstrumentationConfig`\>[]

***

### logExporter?

> `optional` **logExporter?**: [`ExporterSpec`](../type-aliases/ExporterSpec.md)

***

### metricExporter?

> `optional` **metricExporter?**: [`ExporterSpec`](../type-aliases/ExporterSpec.md)

***

### minimumSeverity?

> `optional` **minimumSeverity?**: `SeverityNumber`

***

### sampler?

> `optional` **sampler?**: [`SamplerSpec`](../type-aliases/SamplerSpec.md)

***

### traceExporter?

> `optional` **traceExporter?**: [`ExporterSpec`](../type-aliases/ExporterSpec.md)

