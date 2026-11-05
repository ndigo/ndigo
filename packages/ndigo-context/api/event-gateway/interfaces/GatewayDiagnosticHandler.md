[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [event-gateway](../README.md) / GatewayDiagnosticHandler

# Interface: GatewayDiagnosticHandler

Receives relay registration and blocking diagnostics.

## Methods

### onRelayBlocked()?

> `optional` **onRelayBlocked**(`result`): `void`

Called when a relay is rejected.

#### Parameters

##### result

[`RelayValidationResult`](RelayValidationResult.md)

The blocked relay result.

#### Returns

`void`

***

### onRelayRegistered()?

> `optional` **onRelayRegistered**(`relay`): `void`

Called when a relay is accepted.

#### Parameters

##### relay

[`ContextEventRelay`](ContextEventRelay.md)

The accepted relay.

#### Returns

`void`
