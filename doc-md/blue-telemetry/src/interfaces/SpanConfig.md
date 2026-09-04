[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / SpanConfig

# Interface: SpanConfig

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:7

Shared span configuration for method instrumentation.

## Properties

### name

> **name**: `string`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:9

Span name as it appears in traces.

***

### kind

> **kind**: `SpanKind`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:11

Span kind (CLIENT, SERVER, etc.).

***

### attributes?

> `optional` **attributes?**: (`instance`, `args`) => `Record`\<`string`, `any`\>

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:13

Optional callback that produces span attributes from the patched instance and arguments.

#### Parameters

##### instance

`any`

##### args

`any`[]

#### Returns

`Record`\<`string`, `any`\>

***

### onEnd?

> `optional` **onEnd?**: (`span`, `outcome`, `instance`, `args`) => `void`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:24

Optional callback invoked just before the span ends, with the method's
result (or thrown error) and the patched instance + args — for outcome
attributes like handler name or status.

#### Parameters

##### span

`Span`

The span about to end.

##### outcome

Either `{ ok: true, value }` or `{ ok: false, error }`.

###### ok

`boolean`

###### value?

`unknown`

###### error?

`unknown`

##### instance

`any`

The patched instance.

##### args

`any`[]

The original method arguments.

#### Returns

`void`
