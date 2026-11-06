[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [telemetry](../README.md) / JobSpan

# Interface: JobSpan

One in-flight job-execution span, ended exactly once by the runner.

## Methods

### end()

> **end**(`outcome`, `error?`): `void`

Records the outcome and ends the span.

#### Parameters

##### outcome

`"success"` \| `"error"`

`'success'` or `'error'`.

##### error?

`unknown`

The failure, when `outcome` is `'error'`.

#### Returns

`void`
