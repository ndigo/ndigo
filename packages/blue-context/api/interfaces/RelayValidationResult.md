[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / RelayValidationResult

# Interface: RelayValidationResult

Result of validating a relay registration.

## Properties

### reason?

> `readonly` `optional` **reason?**: `string`

Human-readable reason for rejection, when invalid.

***

### relay

> `readonly` **relay**: [`ContextEventRelay`](ContextEventRelay.md)

The relay that was validated.

***

### valid

> `readonly` **valid**: `boolean`

Whether the relay is allowed.
