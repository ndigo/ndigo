[**@blue/flags v0.0.1**](../README.md)

***

[@blue/flags](../README.md) / FlagEvaluator

# Interface: FlagEvaluator

Feature-flag backend contract. Implementations MUST be safe for
concurrent use and MUST NOT throw from `evaluate` — a broken backend
degrades to the supplied default, never crashes the caller.

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier e.g. `'property'`, `'openfeature'`.

## Methods

### close()?

> `optional` **close**(): `Promise`\<`void`\>

Releases backend resources (optional; called on context close).

#### Returns

`Promise`\<`void`\>

***

### evaluate()

> **evaluate**\<`T`\>(`flag`, `defaultValue`, `ctx?`): `Promise`\<[`FlagEvaluation`](FlagEvaluation.md)\<`T`\>\>

Evaluates `flag` to the type of `defaultValue`.

#### Type Parameters

##### T

`T` *extends* [`FlagValue`](../type-aliases/FlagValue.md)

#### Parameters

##### flag

`string`

The flag key (see [validateFlagKey](../functions/validateFlagKey.md) grammar).

##### defaultValue

`T`

The value returned when the flag is missing,
  disabled, or the provider errors — the type parameter for the
  evaluation.

##### ctx?

[`FlagEvaluationContext`](FlagEvaluationContext.md)

Optional targeting context.

#### Returns

`Promise`\<[`FlagEvaluation`](FlagEvaluation.md)\<`T`\>\>

The evaluation; never rejects.
