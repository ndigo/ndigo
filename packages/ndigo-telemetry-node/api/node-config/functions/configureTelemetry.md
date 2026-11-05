[**@ndigo/telemetry-node v0.0.1**](../../README.md)

***

[@ndigo/telemetry-node](../../README.md) / [node-config](../README.md) / configureTelemetry

# Function: configureTelemetry()

> **configureTelemetry**(`config`): `NodeSDK` \| `undefined`

Configures the global OpenTelemetry providers for one process (AD-32).

OTel's API registers global providers once per process — later calls are
silently ignored — so this shim warns loudly instead: the first call wins
and repeated calls indicate a wiring bug (tests, hot reload, or a second
subsystem trying to reconfigure). Configuration validation (sampler
ratios, exporter urls) runs before the latch and fails loud on every
call.

## Parameters

### config

[`TelemetryConfig`](../interfaces/TelemetryConfig.md)

## Returns

`NodeSDK` \| `undefined`
