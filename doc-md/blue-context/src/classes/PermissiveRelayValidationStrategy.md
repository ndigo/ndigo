[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / PermissiveRelayValidationStrategy

# Class: PermissiveRelayValidationStrategy

Defined in: [packages/blue-context/src/event-gateway.ts:118](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-118)

Permissive relay validator that accepts all relays.

## Implements

- [`RelayValidationStrategy`](../interfaces/RelayValidationStrategy.md)

## Constructors

### Constructor

> **new PermissiveRelayValidationStrategy**(): `PermissiveRelayValidationStrategy`

#### Returns

`PermissiveRelayValidationStrategy`

## Methods

### validate()

> **validate**(`relay`): [`RelayValidationResult`](../interfaces/RelayValidationResult.md)

Defined in: [packages/blue-context/src/event-gateway.ts:125](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-125)

Accepts every relay without additional checks.

#### Parameters

##### relay

[`ContextEventRelay`](../interfaces/ContextEventRelay.md)

The relay to validate.

#### Returns

[`RelayValidationResult`](../interfaces/RelayValidationResult.md)

A successful validation result.

#### Implementation of

[`RelayValidationStrategy`](../interfaces/RelayValidationStrategy.md).[`validate`](../interfaces/RelayValidationStrategy.md#validate)
