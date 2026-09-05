[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / RelayValidationResult

# Interface: RelayValidationResult

Defined in: [packages/blue-context/src/event-gateway.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-26)

Result of validating a relay registration.

## Properties

### relay

> `readonly` **relay**: [`ContextEventRelay`](ContextEventRelay.md)

Defined in: [packages/blue-context/src/event-gateway.ts:30](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-30)

The relay that was validated.

***

### valid

> `readonly` **valid**: `boolean`

Defined in: [packages/blue-context/src/event-gateway.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-34)

Whether the relay is allowed.

***

### reason?

> `readonly` `optional` **reason?**: `string`

Defined in: [packages/blue-context/src/event-gateway.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-38)

Human-readable reason for rejection, when invalid.
