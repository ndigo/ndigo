[**@blue/telemetry-web v0.0.1**](../README.md)

***

[@blue/telemetry-web](../README.md) / configureBrowserTelemetry

# Function: configureBrowserTelemetry()

> **configureBrowserTelemetry**(`config`): [`BrowserTelemetryHandle`](../interfaces/BrowserTelemetryHandle.md)

Configures the global OpenTelemetry providers for a browser process.

Idempotent: OTel's global providers register once per process, so a repeat
call while the configured providers are still live warns and returns the
existing handle (TEL-05). The returned handle flushes stashed telemetry
and tears the providers down.

## Parameters

### config

[`BrowserTelemetryConfig`](../interfaces/BrowserTelemetryConfig.md)

Service identity, exporter gating, and diagnostics options.

## Returns

[`BrowserTelemetryHandle`](../interfaces/BrowserTelemetryHandle.md)

The telemetry lifecycle handle.
