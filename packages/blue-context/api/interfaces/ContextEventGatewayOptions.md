[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ContextEventGatewayOptions

# Interface: ContextEventGatewayOptions

Configures relay validation and diagnostics for a gateway.

## Properties

### diagnosticHandler?

> `optional` **diagnosticHandler?**: [`GatewayDiagnosticHandler`](GatewayDiagnosticHandler.md)

Optional diagnostic callback sink.

***

### throwOnInvalid?

> `optional` **throwOnInvalid?**: `boolean`

Throws instead of silently blocking invalid relays.

***

### validationStrategy?

> `optional` **validationStrategy?**: [`RelayValidationStrategy`](RelayValidationStrategy.md)

Strategy used to validate relays.
