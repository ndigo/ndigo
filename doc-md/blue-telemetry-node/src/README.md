[**BlueJS Framework v0.0.1**](../../README.md)

***

[BlueJS Framework](../../modules.md) / blue-telemetry-node/src

# blue-telemetry-node/src

@blue/telemetry-node — Node.js telemetry entry point.

NodeSDK configuration and the Node platform instrumentations:
- `HTTPServerInstrumentation`, `HTTPResponseViewTargetInstrumentation`
- `DispatcherInstrumentation`, `ContextInstrumentation`, `CountedRegistry`
  instrumentation bases (isomorphic, re-exported for Node setup paths)

Import `@blue/telemetry` (root) for the isomorphic API — logger, metrics,
severity, and tracing decorators with zero Node SDK weight.

## Since

1.0.0

## Classes

- [ContextInstrumentation](classes/ContextInstrumentation.md)
- [HTTPResponseViewTargetInstrumentation](classes/HTTPResponseViewTargetInstrumentation.md)
- [HTTPServerInstrumentation](classes/HTTPServerInstrumentation.md)
- [SeverityFilterLogRecordProcessor](classes/SeverityFilterLogRecordProcessor.md)

## Interfaces

- [TelemetryConfig](interfaces/TelemetryConfig.md)

## Functions

- [configureTelemetry](functions/configureTelemetry.md)
