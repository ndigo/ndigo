[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [instrumentation/base](../README.md) / SpanConfig

# Interface: SpanConfig

Shared span configuration for method instrumentation.

## Properties

### attributes?

> `optional` **attributes?**: (`instance`, `args`) => `Record`\<`string`, `unknown`\>

Optional callback that produces span attributes from the patched instance and arguments.

#### Parameters

##### instance

`unknown`

##### args

`unknown`[]

#### Returns

`Record`\<`string`, `unknown`\>

***

### kind

> **kind**: `SpanKind`

Span kind (CLIENT, SERVER, etc.).

***

### name

> **name**: `string`

Span name as it appears in traces.

***

### onEnd?

> `optional` **onEnd?**: (`span`, `outcome`, `instance`, `args`) => `void`

Optional callback invoked just before the span ends, with the method's
result (or thrown error) and the patched instance + args — for outcome
attributes like handler name or status.

#### Parameters

##### span

`Span`

The span about to end.

##### outcome

Either `{ ok: true, value }` or `{ ok: false, error }`.

###### error?

`unknown`

###### ok

`boolean`

###### value?

`unknown`

##### instance

`unknown`

The patched instance.

##### args

`unknown`[]

The original method arguments.

#### Returns

`void`
