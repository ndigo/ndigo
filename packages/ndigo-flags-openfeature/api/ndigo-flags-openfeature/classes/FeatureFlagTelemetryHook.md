[**@ndigo/flags-openfeature v0.0.1**](../../README.md)

***

[@ndigo/flags-openfeature](../../README.md) / [ndigo-flags-openfeature](../README.md) / FeatureFlagTelemetryHook

# Class: FeatureFlagTelemetryHook

Emits one evaluation span per flag evaluation with the
`feature_flag.*` semconv attributes. Abnormal evaluations — any
resolution carrying an `errorCode`, from `FLAG_NOT_FOUND` to provider
failures — route through the OpenFeature **error** phase by SDK design:
the span gets ERROR status, the exception, and the classification as
`error.type` (the OpenFeature error code when present, else the error's
name). Clean resolutions get reason/variant attributes.

## Implements

- `Hook`

## Constructors

### Constructor

> **new FeatureFlagTelemetryHook**(): `FeatureFlagTelemetryHook`

#### Returns

`FeatureFlagTelemetryHook`

## Methods

### after()

> **after**(`hookContext`, `evaluationDetails`, `_hookHints?`): `void`

Annotates the span with the resolution outcome (reason, variant) —
clean resolutions only; errorCode results route through
[error](#error) (the SDK's hook contract).

#### Parameters

##### hookContext

`Readonly`\<`HookContext`\>

##### evaluationDetails

`EvaluationDetails`\<`FlagValue`\>

##### \_hookHints?

`Readonly`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`void`

#### Implementation of

`Hook.after`

***

### before()

> **before**(`hookContext`, `_hookHints?`): `void`

Opens the evaluation span and records the key/provider identity.

#### Parameters

##### hookContext

`BeforeHookContext`

##### \_hookHints?

`Readonly`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`void`

#### Implementation of

`Hook.before`

***

### error()

> **error**(`hookContext`, `error`, `_hookHints?`): `void`

Records abnormal evaluations: span status ERROR, the exception, and
the OpenFeature error classification as `error.type` — the error
code when the error carries one, else the error's name.

#### Parameters

##### hookContext

`Readonly`\<`HookContext`\>

##### error

`unknown`

##### \_hookHints?

`Readonly`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`void`

#### Implementation of

`Hook.error`

***

### finally()

> **finally**(`hookContext`, `_evaluationDetails`, `_hookHints?`): `void`

Ends the span (success or failure path — `finally` always runs).

#### Parameters

##### hookContext

`Readonly`\<`HookContext`\>

##### \_evaluationDetails

`EvaluationDetails`\<`FlagValue`\>

##### \_hookHints?

`Readonly`\<`Record`\<`string`, `unknown`\>\>

#### Returns

`void`

#### Implementation of

`Hook.finally`
