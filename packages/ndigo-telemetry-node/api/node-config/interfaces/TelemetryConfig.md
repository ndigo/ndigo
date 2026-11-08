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

OTel instrumentations registered with the NodeSDK.

***

### logExporter?

> `optional` **logExporter?**: [`ExporterSpec`](../type-aliases/ExporterSpec.md)

Log exporter spec; defaults to the console exporter.

***

### metricExporter?

> `optional` **metricExporter?**: [`ExporterSpec`](../type-aliases/ExporterSpec.md)

Metric exporter spec; `'prometheus'` selects the pull reader.

***

### minimumSeverity?

> `optional` **minimumSeverity?**: `SeverityNumber`

Minimum severity routed to the OpenTelemetry log pipeline.

***

### sampler?

> `optional` **sampler?**: [`SamplerSpec`](../type-aliases/SamplerSpec.md)

Trace sampler preset or raw OTel sampler; defaults to `'always'`.

***

### traceExporter?

> `optional` **traceExporter?**: [`ExporterSpec`](../type-aliases/ExporterSpec.md)

Trace exporter spec; defaults to the console exporter.
