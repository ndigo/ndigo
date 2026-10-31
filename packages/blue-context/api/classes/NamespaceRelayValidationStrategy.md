[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / NamespaceRelayValidationStrategy

# Class: NamespaceRelayValidationStrategy

Namespace-based relay validator for `site:*` and `<feature>:*` contracts.

## Implements

- [`RelayValidationStrategy`](../interfaces/RelayValidationStrategy.md)

## Constructors

### Constructor

> **new NamespaceRelayValidationStrategy**(`options?`): `NamespaceRelayValidationStrategy`

Creates a namespace validator.

#### Parameters

##### options?

[`NamespaceRelayValidationOptions`](../interfaces/NamespaceRelayValidationOptions.md) = `{}`

Validation options.

#### Returns

`NamespaceRelayValidationStrategy`

## Properties

### featureNamespace?

> `readonly` `optional` **featureNamespace?**: `string`

## Methods

### validate()

> **validate**(`relay`): [`RelayValidationResult`](../interfaces/RelayValidationResult.md)

Validates that both relay endpoints use allowed namespaces.

#### Parameters

##### relay

[`ContextEventRelay`](../interfaces/ContextEventRelay.md)

The relay to validate.

#### Returns

[`RelayValidationResult`](../interfaces/RelayValidationResult.md)

The validation result.

#### Implementation of

[`RelayValidationStrategy`](../interfaces/RelayValidationStrategy.md).[`validate`](../interfaces/RelayValidationStrategy.md#validate)
