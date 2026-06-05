[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ContextEventGatewayOptions

# Interface: ContextEventGatewayOptions

Defined in: packages/blue-context/src/event-gateway.ts:75

Configures relay validation and diagnostics for a gateway.

## Properties

### diagnosticHandler?

> `optional` **diagnosticHandler?**: [`GatewayDiagnosticHandler`](GatewayDiagnosticHandler.md)

Defined in: packages/blue-context/src/event-gateway.ts:79

Optional diagnostic callback sink.

***

### throwOnInvalid?

> `optional` **throwOnInvalid?**: `boolean`

Defined in: packages/blue-context/src/event-gateway.ts:83

Throws instead of silently blocking invalid relays.

***

### validationStrategy?

> `optional` **validationStrategy?**: [`RelayValidationStrategy`](RelayValidationStrategy.md)

Defined in: packages/blue-context/src/event-gateway.ts:87

Strategy used to validate relays.
