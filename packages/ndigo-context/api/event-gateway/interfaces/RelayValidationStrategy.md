[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [event-gateway](../README.md) / RelayValidationStrategy

# Interface: RelayValidationStrategy

Validates relay registrations before they are attached.

## Methods

### validate()

> **validate**(`relay`): [`RelayValidationResult`](RelayValidationResult.md)

Validates a relay definition.

#### Parameters

##### relay

[`ContextEventRelay`](ContextEventRelay.md)

The relay to validate.

#### Returns

[`RelayValidationResult`](RelayValidationResult.md)

The validation result.
