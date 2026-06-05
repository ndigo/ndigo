[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / NamespaceRelayValidationStrategy

# Class: NamespaceRelayValidationStrategy

Defined in: packages/blue-context/src/event-gateway.ts:136

Namespace-based relay validator for `site:*` and `<feature>:*` contracts.

## Implements

- [`RelayValidationStrategy`](../interfaces/RelayValidationStrategy.md)

## Constructors

### Constructor

> **new NamespaceRelayValidationStrategy**(`options?`): `NamespaceRelayValidationStrategy`

Defined in: packages/blue-context/src/event-gateway.ts:144

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

Defined in: packages/blue-context/src/event-gateway.ts:137

## Methods

### validate()

> **validate**(`relay`): [`RelayValidationResult`](../interfaces/RelayValidationResult.md)

Defined in: packages/blue-context/src/event-gateway.ts:154

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
