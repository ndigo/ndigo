[**@blue/flags v0.0.1**](../README.md)

***

[@blue/flags](../README.md) / PropertyFlagProvider

# Class: PropertyFlagProvider

The local, zero-config flag provider: `feature.<flag>` properties drive
evaluations, read live on every call.

Semantics (AD-82 D-3):
- missing property → `DEFAULT` with the caller's default value;
- boolean: truthy / `'true'` → `STATIC` true; `'false'`, `0`, `''`,
  `null` → `DISABLED` false;
- percentage rollouts: `<namespace>.rollout.<flag>` in [0, 1] gates an
  enabled flag per `evaluationContext.targetingKey` (`SPLIT` buckets).
- number/string: pass through when the type matches, else
  `TYPE_MISMATCH` + default;
- object: JSON values and JSON-parsable strings pass through, else
  `PARSE_ERROR` + default.

## Implements

- [`FlagEvaluator`](../interfaces/FlagEvaluator.md)

## Constructors

### Constructor

> **new PropertyFlagProvider**(`options`): `PropertyFlagProvider`

#### Parameters

##### options

[`PropertyFlagProviderOptions`](../interfaces/PropertyFlagProviderOptions.md)

The reader and optional namespace.

#### Returns

`PropertyFlagProvider`

#### Throws

When the namespace is empty or malformed.

## Properties

### kind

> `readonly` **kind**: `"property"` = `'property'`

Backend identifier.

#### Implementation of

[`FlagEvaluator`](../interfaces/FlagEvaluator.md).[`kind`](../interfaces/FlagEvaluator.md#kind)

## Methods

### evaluate()

> **evaluate**\<`T`\>(`flag`, `defaultValue`, `ctx?`): `Promise`\<[`FlagEvaluation`](../interfaces/FlagEvaluation.md)\<`T`\>\>

Evaluates the flag against the current property state. Never
throws: a throwing reader resolves as `ERROR` + `${defaultValue}`.

#### Type Parameters

##### T

`T` *extends* [`FlagValue`](../type-aliases/FlagValue.md)

#### Parameters

##### flag

`string`

##### defaultValue

`T`

##### ctx?

[`FlagEvaluationContext`](../interfaces/FlagEvaluationContext.md)

#### Returns

`Promise`\<[`FlagEvaluation`](../interfaces/FlagEvaluation.md)\<`T`\>\>

#### Implementation of

[`FlagEvaluator`](../interfaces/FlagEvaluator.md).[`evaluate`](../interfaces/FlagEvaluator.md#evaluate)

***

### keyFor()

> **keyFor**(`flag`): `string`

The property key a flag resolves to: `<namespace>.<flag>`.

#### Parameters

##### flag

`string`

#### Returns

`string`
