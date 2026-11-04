[**@ndigo/telemetry-web v0.0.1**](../README.md)

***

[@ndigo/telemetry-web](../README.md) / BrowserTelemetryConfig

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
A configured `traceUrl` always enables trace export, even when
`useConsoleExporters` is `false`.

***

### useConsoleExporters?

> `optional` **useConsoleExporters?**: `boolean`

When `false`, disables the console exporters. This is NOT a global
"export off" switch: a configured `traceUrl` still exports spans over
OTLP/HTTP regardless of this flag (console and OTLP are independent).
No OTLP targets exist for metrics or logs, so those signals are gated
solely by this flag and remain console-only — and, with `false`, the
log pipeline is disabled entirely, so application logs are **not**
routed through OpenTelemetry (they stay on the console bridge).
