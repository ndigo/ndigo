[**BlueJS Framework v0.0.1**](../../README.md)

***

[BlueJS Framework](../../modules.md) / blue-telemetry-web/src

# blue-telemetry-web/src

@blue/telemetry-web — browser telemetry entry point.

Browser telemetry configuration and web instrumentations:
- `configureBrowserTelemetry` (console providers, resource from attributes)
- `RouterInstrumentation`, `DispatcherInstrumentation`, `ContextInstrumentation`

Import `@blue/telemetry` (root) for the isomorphic API — logger, metrics,
severity, and tracing decorators with zero browser SDK weight.

## Since

1.0.0

## Classes

- [ContextInstrumentation](classes/ContextInstrumentation.md)
- [DispatcherInstrumentation](classes/DispatcherInstrumentation.md)
- [RouterInstrumentation](classes/RouterInstrumentation.md)

## Interfaces

- [BrowserTelemetryConfig](interfaces/BrowserTelemetryConfig.md)

## Functions

- [configureBrowserTelemetry](functions/configureBrowserTelemetry.md)
