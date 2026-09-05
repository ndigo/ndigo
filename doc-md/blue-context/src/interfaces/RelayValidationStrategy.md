[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / RelayValidationStrategy

# Interface: RelayValidationStrategy

Defined in: [packages/blue-context/src/event-gateway.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-44)

Validates relay registrations before they are attached.

## Methods

### validate()

> **validate**(`relay`): [`RelayValidationResult`](RelayValidationResult.md)

Defined in: [packages/blue-context/src/event-gateway.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-51)

Validates a relay definition.

#### Parameters

##### relay

[`ContextEventRelay`](ContextEventRelay.md)

The relay to validate.

#### Returns

[`RelayValidationResult`](RelayValidationResult.md)

The validation result.
