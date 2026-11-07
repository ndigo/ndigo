[**@ndigo/flags-openfeature v0.0.1**](../../README.md)

***

[@ndigo/flags-openfeature](../../README.md) / [openfeature-flag-evaluator](../README.md) / OpenFeatureFlagEvaluator

# Class: OpenFeatureFlagEvaluator

The OpenFeature bridge: evaluates through an OpenFeature client and
returns the SPI's `FlagEvaluation` (reason/error vocabularies match, so
the mapping is a translation, not a reinterpretation).

Behavior notes (AD-87):
- **Never throws**: the SDK's client methods must not throw and the SDK
  converts provider failures to `default + errorCode`; a violating hook
  or provider is caught here as `ERROR` + `GENERAL`.
- A provider that supplies no reason resolves as `UNKNOWN`.
- `flagMetadata` is always an object (the SDK's details carry an empty
  record when the provider set none).

## Implements

- `FlagEvaluator`

## Constructors

### Constructor

> **new OpenFeatureFlagEvaluator**(`options?`): `OpenFeatureFlagEvaluator`

#### Parameters

##### options?

[`OpenFeatureFlagEvaluatorOptions`](../interfaces/OpenFeatureFlagEvaluatorOptions.md) = `{}`

An explicit client, or a domain key resolved against
  the global OpenFeature API; omit both for the global default client.

#### Returns

`OpenFeatureFlagEvaluator`

#### Throws

When both `client` and `domain` are given.

## Properties

### kind

> `readonly` **kind**: `"openfeature"` = `'openfeature'`

Backend identifier.

#### Implementation of

`FlagEvaluator.kind`

## Methods

### evaluate()

> **evaluate**\<`T`\>(`flag`, `defaultValue`, `ctx?`): `Promise`\<`FlagEvaluation`\<`T`\>\>

Evaluates the flag through the OpenFeature client. Never rejects: any
escape (a hook/provider violating the SDK's no-throw contract)
resolves as the caller's default with `reason: 'ERROR'`.

#### Type Parameters

##### T

`T` *extends* `FlagValue`

#### Parameters

##### flag

`string`

The flag key to evaluate.

##### defaultValue

`T`

The value returned when evaluation fails.

##### ctx?

`FlagEvaluationContext`

Optional evaluation context forwarded to OpenFeature.

#### Returns

`Promise`\<`FlagEvaluation`\<`T`\>\>

The evaluated value plus reason, error code, and metadata.

#### Implementation of

`FlagEvaluator.evaluate`
