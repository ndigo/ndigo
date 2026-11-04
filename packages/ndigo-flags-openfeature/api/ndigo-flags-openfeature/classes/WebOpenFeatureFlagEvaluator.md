[**@ndigo/flags-openfeature v0.0.1**](../../README.md)

***

[@ndigo/flags-openfeature](../../README.md) / [ndigo-flags-openfeature](../README-1.md) / WebOpenFeatureFlagEvaluator

# Class: WebOpenFeatureFlagEvaluator

The browser OpenFeature bridge: evaluates through a web-SDK client and
returns the SPI's `FlagEvaluation`. The reason/error vocabularies match,
the mapping never throws, `flagMetadata` is always an object, and a
provider-resolved `null` narrows to the caller's default with
`TYPE_MISMATCH` — identical semantics to the server evaluator.

The per-call `ctx` parameter is **not forwarded** (the web SDK's context
is static — see the module doc).

## Implements

- `FlagEvaluator`

## Constructors

### Constructor

> **new WebOpenFeatureFlagEvaluator**(`options?`): `WebOpenFeatureFlagEvaluator`

#### Parameters

##### options?

[`WebOpenFeatureFlagEvaluatorOptions`](../interfaces/WebOpenFeatureFlagEvaluatorOptions.md) = `{}`

An explicit client, or a domain key resolved against
  the global web OpenFeature API; omit both for the global default.

#### Returns

`WebOpenFeatureFlagEvaluator`

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

> **evaluate**\<`T`\>(`flag`, `defaultValue`, `_ctx?`): `Promise`\<`FlagEvaluation`\<`T`\>\>

Evaluates the flag through the web client. Never rejects: any escape
(a hook/provider violating the SDK's no-throw contract) resolves as
the caller's default with `reason: 'ERROR'`.

#### Type Parameters

##### T

`T` *extends* `FlagValue`

#### Parameters

##### flag

`string`

##### defaultValue

`T`

##### \_ctx?

`FlagEvaluationContext`

#### Returns

`Promise`\<`FlagEvaluation`\<`T`\>\>

#### Implementation of

`FlagEvaluator.evaluate`
