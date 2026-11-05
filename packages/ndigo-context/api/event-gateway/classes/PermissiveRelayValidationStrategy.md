[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [event-gateway](../README.md) / PermissiveRelayValidationStrategy

# Class: PermissiveRelayValidationStrategy

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
