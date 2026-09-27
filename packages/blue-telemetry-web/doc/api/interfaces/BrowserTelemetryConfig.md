[**@blue/telemetry-web v0.0.1**](../README.md)

***

[@blue/telemetry-web](../README.md) / BrowserTelemetryConfig

# Interface: BrowserTelemetryConfig

## Properties

### enableDiagnostics?

> `optional` **enableDiagnostics?**: `boolean`

***

### minimumSeverity?

> `optional` **minimumSeverity?**: `SeverityNumber`

***

### serviceName

> **serviceName**: `string`

***

### traceUrl?

> `optional` **traceUrl?**: `string`

OTLP/HTTP trace endpoint (e.g. a local OpenTelemetry Collector:
`http://localhost:4318/v1/traces`). When set, spans are exported
there; otherwise the console exporter is used (dev posture).

***

### useConsoleExporters?

> `optional` **useConsoleExporters?**: `boolean`
