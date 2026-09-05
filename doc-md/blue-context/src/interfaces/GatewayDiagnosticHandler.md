[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / GatewayDiagnosticHandler

# Interface: GatewayDiagnosticHandler

Defined in: [packages/blue-context/src/event-gateway.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-57)

Receives relay registration and blocking diagnostics.

## Methods

### onRelayBlocked()?

> `optional` **onRelayBlocked**(`result`): `void`

Defined in: [packages/blue-context/src/event-gateway.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-63)

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

Defined in: [packages/blue-context/src/event-gateway.ts:69](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-69)

Called when a relay is accepted.

#### Parameters

##### relay

[`ContextEventRelay`](ContextEventRelay.md)

The accepted relay.

#### Returns

`void`
