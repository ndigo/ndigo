[**@ndigo/flags v0.0.1**](../README.md)

***

[@ndigo/flags](../README.md) / FlagEvaluation

# Interface: FlagEvaluation\<T\>

The outcome of [FlagEvaluator.evaluate](FlagEvaluator.md#evaluate).

The `value` field is always set: abnormal execution returns the caller's
default with `reason: 'ERROR'` and an `errorCode` — evaluation never
throws (AD-82 D-2).

## Type Parameters

### T

`T` *extends* [`FlagValue`](../type-aliases/FlagValue.md)

## Properties

### errorCode?

> `optional` **errorCode?**: [`FlagErrorCode`](../type-aliases/FlagErrorCode.md)

The classification, when the evaluation was abnormal.

***

### errorMessage?

> `optional` **errorMessage?**: `string`

Optional human-readable detail for the error (telemetry only).

***

### flagMetadata?

> `optional` **flagMetadata?**: `Record`\<`string`, `unknown`\>

Provider-supplied metadata for this evaluation (OpenFeature
`flagMetadata`): stable identifiers, config version, bucket info, ….
The bridge always supplies an object (possibly empty).

***

### reason

> **reason**: [`FlagEvaluationReason`](../type-aliases/FlagEvaluationReason.md)

The reason the provider resolved this value — `UNKNOWN` when the
provider supplied none (or an unrecognized one).

***

### value

> **value**: `T`

The evaluated flag value (the supplied default on abnormal execution).

***

### variant?

> `optional` **variant?**: `string`

The flag variant (provider-assigned) when available.
